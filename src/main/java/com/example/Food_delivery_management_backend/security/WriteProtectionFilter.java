package com.example.Food_delivery_management_backend.security;

import com.example.Food_delivery_management_backend.service.OwnerVerificationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Filtro che protegge le operazioni di scrittura (POST, PUT, PATCH, DELETE):
 *
 * - ADMIN: può solo leggere (GET) e gestire operazioni quotidiane.
 *          NON può modificare configurazione
 *          (servizi, categorie, sezioni, prodotti, orari, chi siamo, impostazioni).
 *
 * - OWNER: può fare tutto, ma le operazioni di scrittura richiedono
 *          una verifica passkey (WebAuthn o testuale) attiva server-side.
 */
@Component
public class WriteProtectionFilter extends OncePerRequestFilter {

    private final OwnerVerificationService verificationService;

    // Path di configurazione (solo OWNER verificato può scrivere)
    private static final Set<String> CONFIG_PATH_PREFIXES = Set.of(
            "/api/menu-items",
            "/api/menu-categories",
            "/api/menu-sections",
            "/api/schedule",
            "/api/about",
            "/api/uploads",
            "/api/restaurants",
            "/api/products",
            "/api/product-categories",
            "/api/promotions"
    );

    public WriteProtectionFilter(OwnerVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getRequestURI();

        // GET, OPTIONS, HEAD → sempre permessi (lettura)
        if ("GET".equals(method) || "OPTIONS".equals(method) || "HEAD".equals(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Endpoint di autenticazione → gestiti da @PreAuthorize, non bloccare qui
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Endpoint pubblici (prenotazioni, registrazione centro)
        if (isPublicWrite(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Se non autenticato, lasciare che il JWT filter gestisca
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            filterChain.doFilter(request, response);
            return;
        }

        String role = extractRole(auth);
        String email = auth.getName();

        // Endpoint operativi quotidiani → ADMIN può scrivere
        if (isOperationalWrite(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Endpoint di configurazione → solo OWNER verificato
        if (isConfigWrite(path)) {
            if ("ADMIN".equals(role)) {
                sendJson(response, 403,
                        "{\"error\":\"ADMIN_READ_ONLY\",\"message\":\"Non hai i permessi per questa operazione. Solo il proprietario può modificare.\"}");
                return;
            }
            if ("OWNER".equals(role) && !verificationService.isVerified(email)) {
                sendJson(response, 403,
                        "{\"error\":\"PASSKEY_REQUIRED\",\"message\":\"Verifica con passkey richiesta per le modifiche\"}");
                return;
            }
        }

        // Tutti gli altri endpoint di scrittura (non-config, non-operativi)
        // per OWNER richiedono comunque verifica
        if ("OWNER".equals(role) && !isOperationalWrite(path, method)
                && !verificationService.isVerified(email)) {
            sendJson(response, 403,
                    "{\"error\":\"PASSKEY_REQUIRED\",\"message\":\"Verifica con passkey richiesta per le modifiche\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicWrite(String path) {
        return path.equals("/api/restaurants/register");
    }

    private boolean isOperationalWrite(String path, String method) {
        return false;
    }

    private boolean isConfigWrite(String path) {
        return CONFIG_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private String extractRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse("");
    }

    private void sendJson(HttpServletResponse response, int status, String json) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);
    }
}
