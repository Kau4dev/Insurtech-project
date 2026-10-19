package com.insurtech.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${jwt.secret}")
    private String jwtSecret;

    private JwtParser jwtParser;

    @PostConstruct
    public void init() {
        if (jwtSecret != null) {
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
            this.jwtParser = Jwts.parser().verifyWith(key).build();
        }
    }

    // rotas que não precisam de token
    private static final List<String> PUBLIC_ROUTES = List.of(
            "/api/v1/auth/login",
            "/actuator/health",
            // Swagger UI (agregado no gateway)
            "/swagger-ui",
            "/swagger-ui.html",
            "/webjars/swagger-ui",
            // OpenAPI specs dos serviços downstream (via gateway)
            "/api/v1/sinistros/v3/api-docs",
            "/api/v1/segurados/v3/api-docs",
            "/api/v1/apolices/v3/api-docs",
            "/api/v1/auth/v3/api-docs",
            "/api/v1/notificacao/v3/api-docs",
            "/api/v1/liquidacao/v3/api-docs",
            // OpenAPI spec do próprio gateway
            "/v3/api-docs",
            "/swagger-resources"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Libera requisições preflight do CORS (OPTIONS) para o filtro de CORS tratar
        if (org.springframework.http.HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

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

        // valida o token e extrai claims uma única vez
        Claims claims = parseClaims(token);
        if (claims == null) {
            log.warn("Token inválido para path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // extrai claims e propaga nos headers para os serviços downstream
        String usuarioId = claims.getSubject();
        String papel = claims.get("papel", String.class);

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

    private Claims parseClaims(String token) {
        try {
            if (jwtParser == null) {
                init();
            }
            return jwtParser.parseSignedClaims(token).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
