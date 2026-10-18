package com.insurtech.auth.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.auth.application.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/auth/validar").permitAll()
                        .requestMatchers("/api/v1/auth/usuarios/**").permitAll()
                        .requestMatchers("/api/v1/auth/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            ErrorResponse error = new ErrorResponse(
                                    403,
                                    "Acesso negado. Você não tem permissão para acessar este recurso.",
                                    request.getRequestURI(),
                                    null,
                                    LocalDateTime.now()
                            );
                            objectMapper.writeValue(response.getOutputStream(), error);
                        })
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            ErrorResponse error = new ErrorResponse(
                                    401,
                                    "Não autorizado. Por favor, apresente um token válido.",
                                    request.getRequestURI(),
                                    null,
                                    LocalDateTime.now()
                            );
                            objectMapper.writeValue(response.getOutputStream(), error);
                        })
                );
        return http.build();
    }
}