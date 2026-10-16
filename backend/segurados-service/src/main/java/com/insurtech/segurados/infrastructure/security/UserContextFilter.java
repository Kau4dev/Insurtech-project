package com.insurtech.segurados.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;

import java.util.UUID;

@Component
public class UserContextFilter implements Filter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

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