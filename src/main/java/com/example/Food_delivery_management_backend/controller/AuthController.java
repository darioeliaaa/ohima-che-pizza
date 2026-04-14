package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.dto.LoginRequest;
import com.example.Food_delivery_management_backend.dto.LoginResponse;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.entity.UserRole;
import com.example.Food_delivery_management_backend.service.AuthService;
import com.example.Food_delivery_management_backend.service.OwnerVerificationService;
import com.example.Food_delivery_management_backend.service.RestaurantService;
import com.example.Food_delivery_management_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RestaurantService restaurantService;
    private final UserService userService;
    private final OwnerVerificationService ownerVerificationService;

    // La passkey testuale è salvata come hash BCrypt nella variabile d'ambiente
    @Value("${owner.passkey:}")
    private String ownerPasskey;

    // Rate limiting: max 5 tentativi ogni 15 minuti per IP
    private final ConcurrentHashMap<String, long[]> passkeyAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000; // 15 minuti
    private final BCryptPasswordEncoder passkeyEncoder = new BCryptPasswordEncoder();

    public AuthController(AuthService authService, RestaurantService restaurantService,
                          UserService userService, OwnerVerificationService ownerVerificationService) {
        this.authService = authService;
        this.restaurantService = restaurantService;
        this.userService = userService;
        this.ownerVerificationService = ownerVerificationService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            User user = authService.getUserByEmail(request.getEmail());

            Long restaurantId = null;
            try {
                Restaurant restaurant = restaurantService.findByUserId(user.getId());
                restaurantId = restaurant.getId();
            } catch (RuntimeException ignored) {}

            LoginResponse response = new LoginResponse(
                    token,
                    user.getEmail(),
                    user.getRole().name(),
                    user.getId(),
                    restaurantId
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Login failed: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/owner/verify-passkey")
    public ResponseEntity<?> verifyOwnerPasskey(@RequestBody Map<String, String> body,
                                                Authentication auth,
                                                jakarta.servlet.http.HttpServletRequest httpRequest) {
        // Supporto proxy: usa X-Forwarded-For se presente
        String forwarded = httpRequest.getHeader("X-Forwarded-For");
        String clientIp = (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim()
                : httpRequest.getRemoteAddr();

        // Rate limiting
        if (isRateLimited(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Troppi tentativi. Riprova tra qualche minuto."));
        }

        String passkey = body.get("passkey");
        if (passkey == null || ownerPasskey.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Passkey non configurata"));
        }

        // Supporta sia hash BCrypt che confronto plain text (retrocompatibilità)
        boolean matches;
        if (ownerPasskey.startsWith("$2a$") || ownerPasskey.startsWith("$2b$") || ownerPasskey.startsWith("$2y$")) {
            matches = passkeyEncoder.matches(passkey, ownerPasskey);
        } else {
            matches = java.security.MessageDigest.isEqual(
                    ownerPasskey.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    passkey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }

        if (!matches) {
            recordFailedAttempt(clientIp);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Passkey non valida"));
        }

        // Reset tentativi dopo verifica riuscita
        passkeyAttempts.remove(clientIp);
        ownerVerificationService.markVerified(auth.getName());
        return ResponseEntity.ok(Map.of("verified", true));
    }

    private boolean isRateLimited(String ip) {
        long[] attempts = passkeyAttempts.get(ip);
        if (attempts == null) return false;
        long now = System.currentTimeMillis();
        // Conta tentativi nella finestra
        int count = 0;
        for (long ts : attempts) {
            if (ts > 0 && now - ts < WINDOW_MS) count++;
        }
        return count >= MAX_ATTEMPTS;
    }

    private void recordFailedAttempt(String ip) {
        passkeyAttempts.compute(ip, (key, existing) -> {
            long now = System.currentTimeMillis();
            if (existing == null) {
                long[] arr = new long[MAX_ATTEMPTS];
                arr[0] = now;
                return arr;
            }
            // Shift e aggiungi il nuovo tentativo
            for (int i = 0; i < existing.length; i++) {
                if (existing[i] == 0 || now - existing[i] >= WINDOW_MS) {
                    existing[i] = now;
                    return existing;
                }
            }
            // Array pieno, shifta
            System.arraycopy(existing, 1, existing, 0, existing.length - 1);
            existing[existing.length - 1] = now;
            return existing;
        });
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner/verification-status")
    public ResponseEntity<?> getVerificationStatus(Authentication auth) {
        boolean verified = ownerVerificationService.isVerified(auth.getName());
        return ResponseEntity.ok(Map.of("verified", verified));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/owner/revoke-verification")
    public ResponseEntity<?> revokeVerification(Authentication auth) {
        ownerVerificationService.revoke(auth.getName());
        return ResponseEntity.ok(Map.of("revoked", true));
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/admins")
    public ResponseEntity<?> getAdmins() {
        List<User> admins = userService.findByRole(UserRole.ADMIN);
        List<Map<String, Object>> result = admins.stream().map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "email", u.getEmail(),
                "phoneNumber", u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                "status", u.getStatus().name(),
                "createdAt", u.getCreatedAt().toString()
        )).toList();
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            String phone = body.get("phoneNumber");
            if (email == null || password == null || email.isBlank() || password.length() < 6) {
                return ResponseEntity.badRequest().body("Email e password (min 6 caratteri) obbligatori");
            }
            User user = userService.createUser(email, password, phone, UserRole.ADMIN);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                    "status", user.getStatus().name()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}