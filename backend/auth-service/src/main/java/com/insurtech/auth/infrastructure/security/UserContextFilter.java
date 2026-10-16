package com.insurtech.auth.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class UserContextFilter implements Filter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    private final JwtService jwtService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;

        String correlationId = httpServletRequest.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put("correlationId", correlationId);

        String usuarioId = httpServletRequest.getHeader("X-Usuario-Id");
        String usuarioPapel = httpServletRequest.getHeader("X-Usuario-Papel");

        if ((usuarioId == null || usuarioId.isBlank()) && (usuarioPapel == null || usuarioPapel.isBlank())) {
            String authHeader = httpServletRequest.getHeader("Authorization");
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

        httpServletResponse.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
            UserContextHolder.clear();
        }
    }
}
