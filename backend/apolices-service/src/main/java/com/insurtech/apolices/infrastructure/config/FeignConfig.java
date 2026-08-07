package com.insurtech.apolices.infrastructure.config;

import com.insurtech.apolices.infrastructure.security.UserContextHolder;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor userContextRequestInterceptor() {
        return requestTemplate -> {
            String usuarioId = UserContextHolder.getContext().getUsuarioId();
            String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

            if (usuarioId != null && !usuarioId.isBlank()) {
                requestTemplate.header("X-Usuario-Id", usuarioId);
            }
            if (usuarioPapel != null && !usuarioPapel.isBlank()) {
                requestTemplate.header("X-Usuario-Papel", usuarioPapel);
            }
        };
    }
}
