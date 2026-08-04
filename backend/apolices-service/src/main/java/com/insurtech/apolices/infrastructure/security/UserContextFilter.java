package com.insurtech.apolices.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class UserContextFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;

        String usuarioId = httpServletRequest.getHeader("X-Usuario-Id");
        String usuarioPapel = httpServletRequest.getHeader("X-Usuario-Papel");

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
