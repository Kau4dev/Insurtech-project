package com.insurtech.auth.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class UserContextFilter implements Filter {

    private final JwtService jwtService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;

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

        UserContext context = UserContextHolder.getContext();
        context.setUsuarioId(usuarioId);
        context.setUsuarioPapel(usuarioPapel);

        try {
            chain.doFilter(request, response);
        } finally {
            UserContextHolder.clear();
        }
    }
}
