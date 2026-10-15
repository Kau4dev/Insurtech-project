package com.insurtech.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Configuration
public class RateLimiterConfig {

    /**
     * Resolve por IP: ideal para rotas públicas (como POST /api/v1/auth/login)
     * para proteger contra força bruta e DoS.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return Mono.just(xForwardedFor.split(",")[0].trim());
            }
            InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
            if (remoteAddress != null && remoteAddress.getAddress() != null) {
                return Mono.just(remoteAddress.getAddress().getHostAddress());
            }
            return Mono.just("anonymous");
        };
    }

    /**
     * Resolve por Usuário Autenticado: lê o cabeçalho "X-Usuario-Id"
     * (injetado localmente pelo seu JwtAuthFilter após validar o token).
     * Se o usuário ainda não estiver autenticado, faz fallback seguro para o IP.
     */
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String usuarioId = exchange.getRequest().getHeaders().getFirst("X-Usuario-Id");
            if (usuarioId != null && !usuarioId.isBlank()) {
                return Mono.just("user:" + usuarioId);
            }
            String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return Mono.just("ip:" + xForwardedFor.split(",")[0].trim());
            }
            InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
            if (remoteAddress != null && remoteAddress.getAddress() != null) {
                return Mono.just("ip:" + remoteAddress.getAddress().getHostAddress());
            }
            return Mono.just("anonymous");
        };
    }
}