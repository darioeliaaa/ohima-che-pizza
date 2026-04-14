package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.service.OwnerVerificationService;
import com.example.Food_delivery_management_backend.service.UserService;
import com.example.Food_delivery_management_backend.service.WebAuthnService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/webauthn")
@PreAuthorize("hasRole('OWNER')")
public class WebAuthnController {

    private final WebAuthnService webAuthnService;
    private final UserService userService;
    private final OwnerVerificationService ownerVerificationService;

    public WebAuthnController(WebAuthnService webAuthnService, UserService userService,
                              OwnerVerificationService ownerVerificationService) {
        this.webAuthnService = webAuthnService;
        this.userService = userService;
        this.ownerVerificationService = ownerVerificationService;
    }

    @PostMapping("/register/options")
    public ResponseEntity<?> registrationOptions(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            User user = getUser(auth);
            // Se ha già passkey registrate, deve essere verificato per aggiungerne altre
            if (webAuthnService.hasCredentials(user)
                    && !ownerVerificationService.isVerified(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "PASSKEY_REQUIRED",
                                "message", "Verifica con passkey esistente prima di registrarne una nuova"));
            }
            Map<String, Object> options = webAuthnService.generateRegistrationOptions(user);
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/complete")
    public ResponseEntity<?> registrationComplete(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            User user = getUser(auth);
            // Se ha già passkey registrate, deve essere verificato
            if (webAuthnService.hasCredentials(user)
                    && !ownerVerificationService.isVerified(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "PASSKEY_REQUIRED",
                                "message", "Verifica con passkey esistente prima di registrarne una nuova"));
            }
            String clientDataJSON = body.get("clientDataJSON");
            String attestationObject = body.get("attestationObject");
            String credentialId = body.get("credentialId");
            String credentialName = body.get("credentialName");

            if (clientDataJSON == null || attestationObject == null || credentialId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dati mancanti"));
            }

            Map<String, Object> result = webAuthnService.completeRegistration(
                    user, clientDataJSON, attestationObject, credentialId, credentialName);

            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/authenticate/options")
    public ResponseEntity<?> authenticationOptions(Authentication auth) {
        try {
            User user = getUser(auth);
            if (!webAuthnService.hasCredentials(user)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Nessuna passkey registrata"));
            }
            Map<String, Object> options = webAuthnService.generateAuthenticationOptions(user);
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/authenticate/complete")
    public ResponseEntity<?> authenticationComplete(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            User user = getUser(auth);
            String credentialId = body.get("credentialId");
            String clientDataJSON = body.get("clientDataJSON");
            String authenticatorData = body.get("authenticatorData");
            String signature = body.get("signature");

            if (credentialId == null || clientDataJSON == null
                    || authenticatorData == null || signature == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dati mancanti"));
            }

            boolean verified = webAuthnService.completeAuthentication(
                    user, credentialId, clientDataJSON, authenticatorData, signature);

            // Marca la sessione come verificata server-side
            if (verified) {
                ownerVerificationService.markVerified(auth.getName());
            }

            return ResponseEntity.ok(Map.of("verified", verified));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/credentials")
    public ResponseEntity<?> listCredentials(Authentication auth) {
        try {
            User user = getUser(auth);
            List<Map<String, Object>> credentials = webAuthnService.getCredentials(user);
            return ResponseEntity.ok(credentials);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/credentials/{id}")
    public ResponseEntity<?> deleteCredential(Authentication auth, @PathVariable Long id) {
        try {
            User user = getUser(auth);
            // Per cancellare una passkey, l'owner deve essere verificato
            if (!ownerVerificationService.isVerified(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "PASSKEY_REQUIRED",
                                "message", "Verifica con passkey prima di poter cancellare credenziali"));
            }
            webAuthnService.deleteCredential(user, id);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/has-credentials")
    public ResponseEntity<?> hasCredentials(Authentication auth) {
        try {
            User user = getUser(auth);
            boolean has = webAuthnService.hasCredentials(user);
            return ResponseEntity.ok(Map.of("hasCredentials", has));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private User getUser(Authentication auth) {
        String email = auth.getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
    }
}
