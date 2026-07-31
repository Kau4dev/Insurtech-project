package com.insurtech.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

@Slf4j
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    // rotas que não precisam de token
    private static final List<String> PUBLIC_ROUTES = List.of(
            "/api/auth/login",
            "/actuator/health"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // libera rotas públicas
        if (isPublicRoute(path)) {
            return chain.filter(exchange);
        }

        // verifica se tem o header Authorization
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(AUTH_HEADER);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Requisição sem token para path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        // valida o token localmente (sem chamar o auth-service a cada requisição)
        if (!isTokenValido(token)) {
            log.warn("Token inválido para path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // extrai claims e propaga nos headers para os serviços downstream
        String usuarioId = extrairUsuarioId(token);
        String papel = extrairPapel(token);

        ServerHttpRequest mutatedRequest = exchange.getRequest()
                .mutate()
                .header("X-Usuario-Id", usuarioId)
                .header("X-Usuario-Papel", papel)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -1; // executa antes de qualquer outro filtro
    }

    private boolean isPublicRoute(String path) {
        return PUBLIC_ROUTES.stream().anyMatch(path::startsWith);
    }

    private boolean isTokenValido(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private String extrairUsuarioId(String token) {
        return getClaims(token).getSubject();
    }

    private String extrairPapel(String token) {
        return getClaims(token).get("papel", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = System.getenv().getOrDefault(
                "JWT_SECRET",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
        );
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}
