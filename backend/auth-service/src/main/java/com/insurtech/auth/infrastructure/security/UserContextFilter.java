package com.insurtech.auth.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class UserContextFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put("correlationId", correlationId);

        String usuarioId = request.getHeader("X-Usuario-Id");
        String usuarioPapel = request.getHeader("X-Usuario-Papel");

        if ((usuarioId == null || usuarioId.isBlank()) && (usuarioPapel == null || usuarioPapel.isBlank())) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtService.isTokenValido(token)) {
                    usuarioId = jwtService.extrairUsuarioId(token).toString();
                    usuarioPapel = jwtService.extrairPapel(token);
                }
            }
        }

        if (usuarioId != null && !usuarioId.isBlank()) {
            MDC.put("usuarioId", usuarioId);
        }

        UserContext context = UserContextHolder.getContext();
        context.setUsuarioId(usuarioId);
        context.setUsuarioPapel(usuarioPapel);

        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
            UserContextHolder.clear();
        }
    }
}
