package com.insurtech.sinistros.infrastructure.config;

import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import feign.RequestInterceptor;
import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor userContextRequestInterceptor() {
        return requestTemplate -> {

            String correlationId = MDC.get("correlationId");
            if (correlationId != null && !correlationId.isBlank()) {
                requestTemplate.header("X-Correlation-Id", correlationId);
            }

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
