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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 🟢 NOTA: Usiamo setAllowedOriginPatterns per permettere l'uso dell'asterisco *
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:4200",
                "http://localhost:8080",
                "https://ohima-che-pizza.vercel.app",
                "https://*.vercel.app"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*")); // Accettiamo tutti gli header per non sbagliare
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
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Permettiamo i pre-flight di CORS
                        .requestMatchers(org.springframework.web.cors.CorsUtils::isPreFlightRequest).permitAll()

                        // Tutti gli endpoint sotto /api/ sono aperti per la lettura (GET)
                        // Questo assicura che il menù sia sempre visibile
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/**").permitAll()

                        // Endpoint specifici che devono essere aperti anche in POST (registrazione e login)
                        .requestMatchers("/api/auth/login", "/api/restaurants/register").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings/restaurant/**").permitAll()

                        // Tutto il resto richiede autenticazione
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(writeProtectionFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}