package com.insurtech.gateway.integration;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.net.URI;
import java.util.Date;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "jwt.secret=dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VmaWNpZW50bHktbG9uZy1zZWNyZXQta2V5LWZvci1qd3QtMjU2LWJpdHM="
})
@ActiveProfiles("test")
class GatewaySecurityIT {

    @Autowired
    private WebTestClient webTestClient;

    private final String SECRET = "dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VmaWNpZW50bHktbG9uZy1zZWNyZXQta2V5LWZvci1qd3QtMjU2LWJpdHM=";

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
    void devePermitirAcessoARotaPublicaSemToken() {
        webTestClient.get()
                .uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void deveRetornar401QuandoAcessarRotaProtegidaSemToken() {
        webTestClient.get()
                .uri("/api/v1/sinistros")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void deveRetornar401QuandoAcessarRotaProtegidaComTokenInvalido() {
        webTestClient.get()
                .uri("/api/v1/sinistros")
                .header("Authorization", "Bearer token-invalido")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void devePropagarHeadersQuandoTokenForValido() {
        String tokenValido = gerarToken("user-456", "GESTOR", 60000L);

        webTestClient.get()
                .uri("/api/v1/sinistros")
                .header("Authorization", "Bearer " + tokenValido)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().valueEquals("Returned-X-Usuario-Id", "user-456")
                .expectHeader().valueEquals("Returned-X-Usuario-Papel", "GESTOR")
                .expectBody(String.class).isEqualTo("OK");
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
    }

    static class TestRouteRewriteFilter implements GlobalFilter, org.springframework.core.Ordered {
        private final Environment env;

        public TestRouteRewriteFilter(Environment env) {
            this.env = env;
        }

        @Override
        public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
            URI uri = exchange.getAttribute(org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);
            if (uri != null && "localhost".equals(uri.getHost()) && uri.getPort() == 8087) {
                Integer port = env.getProperty("local.server.port", Integer.class);
                if (port != null) {
                    // Altera a porta para o servidor de teste local e altera o path para evitar loop de roteamento
                    String newPath = uri.getPath().replace("/api/v1/sinistros", "/mock/sinistros");
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
            return 10001; // Executa após RouteToRequestUrlFilter (que tem ordem 10000)
        }
    }

    @RestController
    @RequestMapping("/mock/sinistros")
    static class MockSinistrosController {

        @GetMapping
        public Mono<org.springframework.http.ResponseEntity<String>> getSinistros(
                @RequestHeader(value = "X-Usuario-Id", required = false) String usuarioId,
                @RequestHeader(value = "X-Usuario-Papel", required = false) String usuarioPapel) {

            return Mono.just(org.springframework.http.ResponseEntity.ok()
                    .header("Returned-X-Usuario-Id", usuarioId)
                    .header("Returned-X-Usuario-Papel", usuarioPapel)
                    .body("OK"));
        }
    }
}
