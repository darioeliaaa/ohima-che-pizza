package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.entity.WebAuthnCredential;
import com.example.Food_delivery_management_backend.repository.WebAuthnCredentialRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.cbor.CBORFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebAuthnService {

    private static final long CHALLENGE_TTL_MS = 300_000; // 5 minuti

    private final ConcurrentHashMap<String, ChallengeData> challengeStore = new ConcurrentHashMap<>();
    private final WebAuthnCredentialRepository credentialRepository;
    private final ObjectMapper cborMapper;
    private final ObjectMapper jsonMapper;

    @Value("${webauthn.rp.id:localhost}")
    private String rpId;

    @Value("${webauthn.rp.name:Food Delivery Manager}")
    private String rpName;

    @Value("${webauthn.rp.origins:http://localhost:5173,http://localhost:8080}")
    private String rpOrigins;

    private record ChallengeData(byte[] challenge, long timestamp) {}

    public WebAuthnService(WebAuthnCredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
        this.cborMapper = new ObjectMapper(new CBORFactory());
        this.jsonMapper = new ObjectMapper();
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredChallenges() {
        long now = System.currentTimeMillis();
        challengeStore.entrySet().removeIf(e -> now - e.getValue().timestamp() > CHALLENGE_TTL_MS);
    }

    // ── Registration ─────────────────────────────────────────────

    public Map<String, Object> generateRegistrationOptions(User user) {
        byte[] challenge = new byte[32];
        new SecureRandom().nextBytes(challenge);

        challengeStore.put(user.getEmail() + ":register",
                new ChallengeData(challenge, System.currentTimeMillis()));

        byte[] userHandle = ByteBuffer.allocate(8).putLong(user.getId()).array();

        List<WebAuthnCredential> existing = credentialRepository.findByUser(user);
        List<Map<String, Object>> excludeCredentials = existing.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", "public-key");
            m.put("id", c.getCredentialId());
            return m;
        }).toList();

        Map<String, Object> options = new LinkedHashMap<>();
        options.put("rp", Map.of("name", rpName, "id", rpId));
        options.put("user", Map.of(
                "id", b64url(userHandle),
                "name", user.getEmail(),
                "displayName", user.getEmail()
        ));
        options.put("challenge", b64url(challenge));
        options.put("pubKeyCredParams", List.of(
                Map.of("alg", -7, "type", "public-key"),   // ES256
                Map.of("alg", -257, "type", "public-key")  // RS256
        ));
        options.put("timeout", 120000);
        options.put("excludeCredentials", excludeCredentials);
        options.put("authenticatorSelection", Map.of(
                "residentKey", "preferred",
                "userVerification", "preferred"
        ));
        options.put("attestation", "none");

        return options;
    }

    @Transactional
    public Map<String, Object> completeRegistration(User user,
                                                     String clientDataJSONB64,
                                                     String attestationObjectB64,
                                                     String credentialIdB64,
                                                     String credentialName) {
        try {
            // 1. Verificare la challenge
            ChallengeData cd = challengeStore.remove(user.getEmail() + ":register");
            if (cd == null || System.currentTimeMillis() - cd.timestamp() > CHALLENGE_TTL_MS) {
                throw new SecurityException("Challenge scaduta o non trovata");
            }

            // 2. Verificare clientDataJSON
            byte[] clientDataJSON = Base64.getUrlDecoder().decode(clientDataJSONB64);
            Map<String, Object> clientData = jsonMapper.readValue(clientDataJSON,
                    new TypeReference<Map<String, Object>>() {});

            if (!"webauthn.create".equals(clientData.get("type"))) {
                throw new SecurityException("Tipo client data non valido");
            }
            if (!b64url(cd.challenge()).equals(clientData.get("challenge"))) {
                throw new SecurityException("Challenge non corrispondente");
            }
            verifyOrigin((String) clientData.get("origin"));

            // 3. Decodificare attestationObject (CBOR)
            byte[] attObjBytes = Base64.getUrlDecoder().decode(attestationObjectB64);
            Map<String, Object> attObj = cborMapper.readValue(attObjBytes,
                    new TypeReference<Map<String, Object>>() {});
            byte[] authData = (byte[]) attObj.get("authData");

            // 4. Parsare authData
            ByteBuffer buf = ByteBuffer.wrap(authData);

            byte[] rpIdHash = new byte[32];
            buf.get(rpIdHash);
            verifyRpIdHash(rpIdHash);

            byte flags = buf.get();
            if ((flags & 0x01) == 0) throw new SecurityException("User Present flag non impostato");
            if ((flags & 0x40) == 0) throw new SecurityException("Nessun dato credenziale attestato");

            long signCount = Integer.toUnsignedLong(buf.getInt());

            // Attested credential data
            byte[] aaguid = new byte[16];
            buf.get(aaguid);
            int credIdLen = Short.toUnsignedInt(buf.getShort());
            byte[] credId = new byte[credIdLen];
            buf.get(credId);

            // COSE public key (bytes rimanenti, escluse eventuali estensioni)
            byte[] coseKeyBytes = new byte[buf.remaining()];
            buf.get(coseKeyBytes);

            // Verificare che il credential ID corrisponda
            String computedCredId = b64url(credId);
            if (!computedCredId.equals(credentialIdB64)) {
                throw new SecurityException("Credential ID non corrispondente");
            }

            // Parsare la COSE key per determinare l'algoritmo
            Map<Object, Object> coseKey = parseCoseKey(coseKeyBytes);
            int algorithm = getIntFromCose(coseKey, 3);

            // Validare la chiave pubblica
            buildPublicKey(coseKey, algorithm);

            // 5. Salvare la credenziale
            WebAuthnCredential credential = new WebAuthnCredential();
            credential.setUser(user);
            credential.setCredentialId(credentialIdB64);
            credential.setPublicKey(coseKeyBytes);
            credential.setSignatureCount(signCount);
            credential.setAlgorithm(algorithm);
            credential.setName(credentialName != null && !credentialName.isBlank()
                    ? credentialName : "Passkey");
            credentialRepository.save(credential);

            return Map.of(
                    "id", credential.getId(),
                    "name", credential.getName(),
                    "createdAt", credential.getCreatedAt().toString()
            );

        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Errore durante la registrazione della passkey: " + e.getMessage(), e);
        }
    }

    // ── Authentication ───────────────────────────────────────────

    public Map<String, Object> generateAuthenticationOptions(User user) {
        byte[] challenge = new byte[32];
        new SecureRandom().nextBytes(challenge);

        challengeStore.put(user.getEmail() + ":authenticate",
                new ChallengeData(challenge, System.currentTimeMillis()));

        List<WebAuthnCredential> credentials = credentialRepository.findByUser(user);
        List<Map<String, Object>> allowCredentials = credentials.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", "public-key");
            m.put("id", c.getCredentialId());
            return m;
        }).toList();

        Map<String, Object> options = new LinkedHashMap<>();
        options.put("challenge", b64url(challenge));
        options.put("timeout", 120000);
        options.put("rpId", rpId);
        options.put("allowCredentials", allowCredentials);
        options.put("userVerification", "preferred");

        return options;
    }

    @Transactional
    public boolean completeAuthentication(User user,
                                          String credentialIdB64,
                                          String clientDataJSONB64,
                                          String authenticatorDataB64,
                                          String signatureB64) {
        try {
            // 1. Verificare la challenge
            ChallengeData cd = challengeStore.remove(user.getEmail() + ":authenticate");
            if (cd == null || System.currentTimeMillis() - cd.timestamp() > CHALLENGE_TTL_MS) {
                throw new SecurityException("Challenge scaduta o non trovata");
            }

            // 2. Trovare la credenziale
            WebAuthnCredential credential = credentialRepository.findByCredentialId(credentialIdB64)
                    .orElseThrow(() -> new SecurityException("Credenziale non trovata"));
            if (credential.getUser().getId() != user.getId()) {
                throw new SecurityException("Credenziale non appartiene a questo utente");
            }

            // 3. Verificare clientDataJSON
            byte[] clientDataJSON = Base64.getUrlDecoder().decode(clientDataJSONB64);
            Map<String, Object> clientData = jsonMapper.readValue(clientDataJSON,
                    new TypeReference<Map<String, Object>>() {});

            if (!"webauthn.get".equals(clientData.get("type"))) {
                throw new SecurityException("Tipo client data non valido");
            }
            if (!b64url(cd.challenge()).equals(clientData.get("challenge"))) {
                throw new SecurityException("Challenge non corrispondente");
            }
            verifyOrigin((String) clientData.get("origin"));

            // 4. Verificare authenticator data
            byte[] authenticatorData = Base64.getUrlDecoder().decode(authenticatorDataB64);
            ByteBuffer buf = ByteBuffer.wrap(authenticatorData);

            byte[] rpIdHash = new byte[32];
            buf.get(rpIdHash);
            verifyRpIdHash(rpIdHash);

            byte flags = buf.get();
            if ((flags & 0x01) == 0) throw new SecurityException("User Present flag non impostato");

            long signCount = Integer.toUnsignedLong(buf.getInt());

            // Controllo anti-clonazione
            if (signCount > 0 && signCount <= credential.getSignatureCount()) {
                throw new SecurityException("Possibile clonazione dell'authenticator rilevata");
            }

            // 5. Verificare la firma
            byte[] clientDataHash = sha256(clientDataJSON);
            byte[] signedData = concat(authenticatorData, clientDataHash);
            byte[] signatureBytes = Base64.getUrlDecoder().decode(signatureB64);

            Map<Object, Object> coseKey = parseCoseKey(credential.getPublicKey());
            PublicKey publicKey = buildPublicKey(coseKey, credential.getAlgorithm());

            if (!verifySignature(publicKey, signedData, signatureBytes, credential.getAlgorithm())) {
                throw new SecurityException("Firma non valida");
            }

            // 6. Aggiornare il contatore delle firme
            credential.setSignatureCount(signCount);
            credentialRepository.save(credential);

            return true;

        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Errore durante l'autenticazione: " + e.getMessage(), e);
        }
    }

    // ── Gestione credenziali ─────────────────────────────────────

    public List<Map<String, Object>> getCredentials(User user) {
        return credentialRepository.findByUser(user).stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            m.put("createdAt", c.getCreatedAt().toString());
            return m;
        }).toList();
    }

    @Transactional
    public void deleteCredential(User user, Long credentialId) {
        WebAuthnCredential cred = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credenziale non trovata"));
        if (cred.getUser().getId() != user.getId()) {
            throw new SecurityException("Credenziale non appartiene a questo utente");
        }
        credentialRepository.delete(cred);
    }

    public boolean hasCredentials(User user) {
        return credentialRepository.existsByUser(user);
    }

    // ── Utility crittografiche ───────────────────────────────────

    private void verifyOrigin(String origin) {
        Set<String> allowed = Set.of(rpOrigins.split(","));
        if (!allowed.contains(origin)) {
            throw new SecurityException("Origine non valida: " + origin);
        }
    }

    private void verifyRpIdHash(byte[] rpIdHash) {
        byte[] expected = sha256(rpId.getBytes(StandardCharsets.UTF_8));
        if (!MessageDigest.isEqual(rpIdHash, expected)) {
            throw new SecurityException("RP ID hash non corrispondente");
        }
    }

    private Map<Object, Object> parseCoseKey(byte[] coseBytes) {
        try {
            return cborMapper.readValue(coseBytes, new TypeReference<Map<Object, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Errore nel parsing della chiave COSE", e);
        }
    }

    private Object getCoseValue(Map<Object, Object> coseKey, int key) {
        // Jackson CBOR può restituire le chiavi come Integer o String
        Object val = coseKey.get(key);
        if (val != null) return val;
        val = coseKey.get((long) key);
        if (val != null) return val;
        return coseKey.get(String.valueOf(key));
    }

    private int getIntFromCose(Map<Object, Object> coseKey, int key) {
        Object val = getCoseValue(coseKey, key);
        if (val == null) throw new RuntimeException("Campo COSE mancante: " + key);
        return ((Number) val).intValue();
    }

    private byte[] getBytesFromCose(Map<Object, Object> coseKey, int key) {
        Object val = getCoseValue(coseKey, key);
        if (val == null) throw new RuntimeException("Campo COSE mancante: " + key);
        return (byte[]) val;
    }

    private PublicKey buildPublicKey(Map<Object, Object> coseKey, int algorithm) throws Exception {
        if (algorithm == -7) { // ES256 (P-256)
            byte[] x = getBytesFromCose(coseKey, -2);
            byte[] y = getBytesFromCose(coseKey, -3);

            AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
            params.init(new ECGenParameterSpec("secp256r1"));
            ECParameterSpec ecSpec = params.getParameterSpec(ECParameterSpec.class);

            ECPoint point = new ECPoint(new BigInteger(1, x), new BigInteger(1, y));
            ECPublicKeySpec keySpec = new ECPublicKeySpec(point, ecSpec);
            return KeyFactory.getInstance("EC").generatePublic(keySpec);

        } else if (algorithm == -257) { // RS256
            byte[] n = getBytesFromCose(coseKey, -1);
            byte[] e = getBytesFromCose(coseKey, -2);

            java.security.spec.RSAPublicKeySpec keySpec =
                    new java.security.spec.RSAPublicKeySpec(new BigInteger(1, n), new BigInteger(1, e));
            return KeyFactory.getInstance("RSA").generatePublic(keySpec);

        } else {
            throw new SecurityException("Algoritmo non supportato: " + algorithm);
        }
    }

    private boolean verifySignature(PublicKey publicKey, byte[] data, byte[] signature, int algorithm)
            throws Exception {
        if (algorithm == -7) { // ES256
            Signature sig = Signature.getInstance("SHA256withECDSA");
            sig.initVerify(publicKey);
            sig.update(data);
            byte[] derSig = rawEcSignatureToDer(signature);
            return sig.verify(derSig);

        } else if (algorithm == -257) { // RS256
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(publicKey);
            sig.update(data);
            return sig.verify(signature);
        }
        return false;
    }

    /**
     * Converte firma EC raw (R||S, 64 bytes per P-256) in formato DER.
     * Java Signature.verify() richiede DER, WebAuthn usa formato raw.
     */
    private byte[] rawEcSignatureToDer(byte[] rawSig) {
        // Se già in formato DER, restituisci com'è
        if (rawSig.length != 64 && rawSig[0] == 0x30) {
            return rawSig;
        }

        byte[] r = trimAndPad(Arrays.copyOfRange(rawSig, 0, 32));
        byte[] s = trimAndPad(Arrays.copyOfRange(rawSig, 32, 64));

        int totalLen = 2 + r.length + 2 + s.length;
        byte[] der = new byte[2 + totalLen];
        int idx = 0;
        der[idx++] = 0x30;
        der[idx++] = (byte) totalLen;
        der[idx++] = 0x02;
        der[idx++] = (byte) r.length;
        System.arraycopy(r, 0, der, idx, r.length);
        idx += r.length;
        der[idx++] = 0x02;
        der[idx++] = (byte) s.length;
        System.arraycopy(s, 0, der, idx, s.length);

        return der;
    }

    private byte[] trimAndPad(byte[] value) {
        int start = 0;
        while (start < value.length - 1 && value[start] == 0) start++;

        if ((value[start] & 0x80) != 0) {
            byte[] result = new byte[value.length - start + 1];
            result[0] = 0;
            System.arraycopy(value, start, result, 1, value.length - start);
            return result;
        }

        return Arrays.copyOfRange(value, start, value.length);
    }

    private byte[] sha256(byte[] data) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(data);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private byte[] concat(byte[] a, byte[] b) {
        byte[] result = new byte[a.length + b.length];
        System.arraycopy(a, 0, result, 0, a.length);
        System.arraycopy(b, 0, result, a.length, b.length);
        return result;
    }

    private String b64url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }
}
