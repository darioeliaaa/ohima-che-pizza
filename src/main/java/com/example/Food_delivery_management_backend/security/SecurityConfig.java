package com.example.Food_delivery_management_backend.security;

import com.example.Food_delivery_management_backend.security.jwt.JwtAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
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
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

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

    // 💣 IL FILTRO ASSOLUTO: Questo viene eseguito PRIMA del JwtAuthenticationFilter
    @Bean
    public FilterRegistrationBean<CorsFilter> customCorsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("https://*.vercel.app");
        config.addAllowedOrigin("https://ohima-che-pizza.vercel.app");
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedOrigin("http://localhost:8080");

        // Accettiamo qualsiasi header e metodo per stroncare il problema alla radice
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        // HIGHEST_PRECEDENCE costringe Spring a valutare i CORS prima della sicurezza JWT
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disabilitiamo il CORS interno di Spring perché ora se ne occupa il Filtro Assoluto sopra
                .cors(cors -> cors.disable())
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
                        // La richiesta OPTIONS ormai è già stata gestita dal customCorsFilter,
                        // ma per sicurezza la lasciamo passare anche qui
                        .requestMatchers(org.springframework.web.cors.CorsUtils::isPreFlightRequest).permitAll()

                        // Tutte le GET (letture) pubbliche
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/**").permitAll()

                        // Endpoint specifici pubblici
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/restaurants/register").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings/restaurant/**").permitAll()

                        // Tutto il resto chiuso (ADMIN)
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