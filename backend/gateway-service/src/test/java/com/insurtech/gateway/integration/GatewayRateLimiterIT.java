package com.insurtech.gateway.integration;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.ratelimit.RateLimiter;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.net.URI;
import java.util.Date;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "jwt.secret=dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VmaWNpZW50bHktbG9uZy1zZWNyZXQta2V5LWZvci1qd3QtMjU2LWJpdHM=",
        "management.health.redis.enabled=false"
})
@ActiveProfiles("test")
class GatewayRateLimiterIT {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private RedisRateLimiter redisRateLimiter;

    private final String SECRET = "dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VmaWNpZW50bHktbG9uZy1zZWNyZXQta2V5LWZvci1qd3QtMjU2LWJpdHM=";

    @BeforeEach
    void setUp() {
        Mockito.reset(redisRateLimiter);
    }

    private String gerarToken(String subject, String papel, long expiracaoMillis) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
        return Jwts.builder()
                .subject(subject)
                .claim("papel", papel)
                .expiration(new Date(System.currentTimeMillis() + expiracaoMillis))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Deve permitir requisições com HTTP 200 quando estiver dentro da cota do Rate Limiter")
    void devePermitirRequisicoesAbaixoDoLimiteDeTaxa() {
        // Arrange: RateLimiter permite a requisição
        when(redisRateLimiter.isAllowed(anyString(), anyString()))
                .thenReturn(Mono.just(new RateLimiter.Response(true, Map.of(
                        "X-RateLimit-Remaining", "19",
                        "X-RateLimit-Burst-Capacity", "20"
                ))));

        String tokenValido = gerarToken("user-allowed-123", "ANALISTA", 60000L);

        // Act & Assert
        webTestClient.get()
                .uri("/api/v1/sinistros")
                .header("Authorization", "Bearer " + tokenValido)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().valueEquals("X-RateLimit-Remaining", "19")
                .expectHeader().valueEquals("X-RateLimit-Burst-Capacity", "20")
                .expectBody(String.class).isEqualTo("OK");

        // Verifica que o rate limiter consultou a chave resolvida por usuário
        verify(redisRateLimiter).isAllowed(eq("sinistros-service"), eq("user:user-allowed-123"));
    }

    @Test
    @DisplayName("Deve retornar HTTP 429 Too Many Requests quando a cota de requisições for excedida")
    void deveRetornar429TooManyRequestsQuandoExcederLimiteDeTaxa() {
        // Arrange: simula o Token Bucket esgotado (allowed = false)
        when(redisRateLimiter.isAllowed(anyString(), anyString()))
                .thenReturn(Mono.just(new RateLimiter.Response(false, Map.of(
                        "X-RateLimit-Remaining", "0",
                        "X-RateLimit-Burst-Capacity", "20"
                ))));

        String tokenValido = gerarToken("user-blocked-999", "GESTOR", 60000L);

        // Act & Assert
        webTestClient.get()
                .uri("/api/v1/sinistros")
                .header("Authorization", "Bearer " + tokenValido)
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.TOO_MANY_REQUESTS)
                .expectHeader().valueEquals("X-RateLimit-Remaining", "0")
                .expectHeader().valueEquals("X-RateLimit-Burst-Capacity", "20");

        verify(redisRateLimiter).isAllowed(eq("sinistros-service"), eq("user:user-blocked-999"));
    }

    @Test
    @DisplayName("Deve resolver chave por IP para rota pública não autenticada no Rate Limiter")
    void deveResolverChavePorIpParaRotaPublica() {
        // Arrange
        when(redisRateLimiter.isAllowed(anyString(), anyString()))
                .thenReturn(Mono.just(new RateLimiter.Response(true, Map.of(
                        "X-RateLimit-Remaining", "9",
                        "X-RateLimit-Burst-Capacity", "20"
                ))));

        // Act & Assert
        webTestClient.post()
                .uri("/api/v1/auth/login")
                .header("X-Forwarded-For", "203.0.113.77")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo("LOGIN_OK");

        // Verifica que para rotas sem token a chave foi resolvida com o IP do cliente
        verify(redisRateLimiter).isAllowed(eq("auth-service"), eq("ip:203.0.113.77"));
    }

    @Test
    @DisplayName("Deve retornar 429 na rota pública de login se o IP exceder a capacidade de burst")
    void deveRetornar429EmRotaPublicaQuandoIpExcederLimite() {
        // Arrange
        when(redisRateLimiter.isAllowed(anyString(), anyString()))
                .thenReturn(Mono.just(new RateLimiter.Response(false, Map.of(
                        "X-RateLimit-Remaining", "0",
                        "X-RateLimit-Burst-Capacity", "20"
                ))));

        // Act & Assert
        webTestClient.post()
                .uri("/api/v1/auth/login")
                .header("X-Forwarded-For", "198.51.100.42")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.TOO_MANY_REQUESTS)
                .expectHeader().valueEquals("X-RateLimit-Remaining", "0");

        verify(redisRateLimiter).isAllowed(eq("auth-service"), eq("ip:198.51.100.42"));
    }

    @TestConfiguration
    static class TestFilterConfig {
        @Bean
        public TestRouteRewriteFilter testRouteRewriteFilter(Environment env) {
            return new TestRouteRewriteFilter(env);
        }

        @Bean
        public MockSinistrosController mockSinistrosController() {
            return new MockSinistrosController();
        }

        @Bean
        public MockAuthController mockAuthController() {
            return new MockAuthController();
        }
    }

    static class TestRouteRewriteFilter implements GlobalFilter, org.springframework.core.Ordered {
        private final Environment env;

        public TestRouteRewriteFilter(Environment env) {
            this.env = env;
        }

        @Override
        public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
            URI uri = exchange.getAttribute(org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);
            if (uri != null && "localhost".equals(uri.getHost())) {
                Integer port = env.getProperty("local.server.port", Integer.class);
                if (port != null) {
                    String newPath = uri.getPath();
                    if (newPath.startsWith("/api/v1/sinistros")) {
                        newPath = newPath.replace("/api/v1/sinistros", "/mock/sinistros");
                    } else if (newPath.startsWith("/api/v1/auth")) {
                        newPath = newPath.replace("/api/v1/auth", "/mock/auth");
                    }

                    URI newUri = org.springframework.web.util.UriComponentsBuilder.fromUri(uri)
                            .port(port)
                            .replacePath(newPath)
                            .build()
                            .toUri();
                    exchange.getAttributes().put(org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR, newUri);
                }
            }
            return chain.filter(exchange);
        }

        @Override
        public int getOrder() {
            return 10001; // Executa após RouteToRequestUrlFilter
        }
    }

    @RestController
    @RequestMapping("/mock/sinistros")
    static class MockSinistrosController {
        @GetMapping
        public Mono<org.springframework.http.ResponseEntity<String>> getSinistros() {
            return Mono.just(org.springframework.http.ResponseEntity.ok("OK"));
        }
    }

    @RestController
    @RequestMapping("/mock/auth")
    static class MockAuthController {
        @PostMapping("/login")
        public Mono<org.springframework.http.ResponseEntity<String>> login() {
            return Mono.just(org.springframework.http.ResponseEntity.ok("LOGIN_OK"));
        }
    }
}
