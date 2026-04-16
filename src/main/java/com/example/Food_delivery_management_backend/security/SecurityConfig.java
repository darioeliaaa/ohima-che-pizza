package com.example.Food_delivery_management_backend.security;

import com.example.Food_delivery_management_backend.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final WriteProtectionFilter writeProtectionFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          WriteProtectionFilter writeProtectionFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.writeProtectionFilter = writeProtectionFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins:http://localhost:5173,http://localhost:8080,http://localhost:4200 }")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // ── HTTP Security Headers per produzione ──
                .headers(headers -> headers
                        .contentTypeOptions(contentType -> {})
                        .frameOptions(frame -> frame.deny())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(permissions -> permissions
                                .policy("camera=(), microphone=(), geolocation=()"))
                )

                .authorizeHttpRequests(auth -> auth
                        // public endpoints (no authentication required)
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/restaurants/register").permitAll()
                        .requestMatchers("/api/restaurants/search").permitAll()
                        .requestMatchers("/api/restaurants", "/api/restaurants/").permitAll()
                        .requestMatchers("/api/restaurants/{id}").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/{id}/contacts").permitAll()
                        .requestMatchers("/api/menu-items/restaurant/**").permitAll()
                        .requestMatchers("/api/menu-categories/restaurant/**").permitAll()
                        .requestMatchers("/api/menu-sections/restaurant/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings/restaurant/**").permitAll()

                        // Prodotti (pubblico per lettura)
                        .requestMatchers("/api/products/restaurant/**").permitAll()
                        .requestMatchers("/api/product-categories/restaurant/**").permitAll()

                        // Chi Siamo (pubblico per lettura)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/about/**").permitAll()

                        // Promozioni (pubblico per lettura)
                        .requestMatchers("/api/promotions/active/**").permitAll()

                        // Feature flags (pubblico per lettura)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/{id}/features").permitAll()

                        // File uploads (GET pubblico per immagini)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/uploads/**").permitAll()

                        // Orari e chiusure (pubblico per lettura)
                        .requestMatchers("/api/schedule/hours/**").permitAll()
                        .requestMatchers("/api/schedule/closing-days/**").permitAll()
                        .requestMatchers("/api/schedule/check/**").permitAll()

                        // all other endpoints require authentication (ADMIN)
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(writeProtectionFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}