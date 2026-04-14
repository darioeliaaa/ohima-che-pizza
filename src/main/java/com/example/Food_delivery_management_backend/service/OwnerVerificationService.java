package com.example.Food_delivery_management_backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Gestisce lo stato di verifica passkey server-side.
 * Dopo la verifica con passkey (testuale o WebAuthn), l'owner viene marcato come verificato
 * per un tempo limitato. Le operazioni di scrittura richiedono questa verifica.
 */
@Service
public class OwnerVerificationService {

    private static final long VERIFICATION_TTL_MS = 30 * 60 * 1000; // 30 minuti

    private final ConcurrentHashMap<String, Long> verifiedOwners = new ConcurrentHashMap<>();

    public void markVerified(String email) {
        verifiedOwners.put(email, System.currentTimeMillis());
    }

    public boolean isVerified(String email) {
        Long timestamp = verifiedOwners.get(email);
        if (timestamp == null) return false;
        if (System.currentTimeMillis() - timestamp > VERIFICATION_TTL_MS) {
            verifiedOwners.remove(email);
            return false;
        }
        return true;
    }

    public void revoke(String email) {
        verifiedOwners.remove(email);
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpired() {
        long now = System.currentTimeMillis();
        verifiedOwners.entrySet().removeIf(e -> now - e.getValue() > VERIFICATION_TTL_MS);
    }
}
