package com.insurtech.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.InetSocketAddress;

class RateLimiterConfigTest {

    private RateLimiterConfig rateLimiterConfig;

    @BeforeEach
    void setUp() {
        rateLimiterConfig = new RateLimiterConfig();
    }

    // =========================================================================
    // Testes de userKeyResolver
    // =========================================================================

    @Test
    @DisplayName("Deve resolver chave por usuário quando o header X-Usuario-Id estiver presente")
    void deveResolverChavePorUsuarioQuandoHeaderEstiverPresente() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.userKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/sinistros")
                .header("X-Usuario-Id", "usr-123456")
                .header("X-Forwarded-For", "203.0.113.195")
                .remoteAddress(new InetSocketAddress("192.168.1.50", 8080))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("user:usr-123456")
                .verifyComplete();
    }

    @Test
    @DisplayName("Deve fazer fallback para IP via X-Forwarded-For quando X-Usuario-Id não for informado")
    void deveFazerFallbackParaIpViaXForwardedForQuandoUsuarioNaoInformado() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.userKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login")
                .header("X-Forwarded-For", "198.51.100.25, 10.0.0.1")
                .remoteAddress(new InetSocketAddress("192.168.1.50", 8080))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("ip:198.51.100.25")
                .verifyComplete();
    }

    @Test
    @DisplayName("Deve fazer fallback para remoteAddress quando X-Usuario-Id e X-Forwarded-For estiverem ausentes")
    void deveFazerFallbackParaRemoteAddressQuandoUsuarioEXForwardedForAusentes() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.userKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login")
                .remoteAddress(new InetSocketAddress("172.18.0.5", 8080))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("ip:172.18.0.5")
                .verifyComplete();
    }

    @Test
    @DisplayName("Deve resolver como anonymous no userKeyResolver quando nenhum dado de identificação estiver presente")
    void deveRetornarAnonymousNoUserKeyResolverQuandoNenhumDadoPresente() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.userKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("anonymous")
                .verifyComplete();
    }

    // =========================================================================
    // Testes de ipKeyResolver
    // =========================================================================

    @Test
    @DisplayName("Deve resolver IP via X-Forwarded-For no ipKeyResolver")
    void deveResolverIpKeyResolverViaXForwardedFor() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.ipKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login")
                .header("X-Forwarded-For", "203.0.113.88, 10.0.0.2")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("203.0.113.88")
                .verifyComplete();
    }

    @Test
    @DisplayName("Deve resolver IP via remoteAddress no ipKeyResolver quando X-Forwarded-For não for informado")
    void deveResolverIpKeyResolverViaRemoteAddressQuandoXForwardedForAusente() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.ipKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login")
                .remoteAddress(new InetSocketAddress("10.0.0.99", 8080))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("10.0.0.99")
                .verifyComplete();
    }

    @Test
    @DisplayName("Deve resolver como anonymous no ipKeyResolver quando nenhum IP estiver disponível")
    void deveRetornarAnonymousNoIpKeyResolverQuandoNenhumIpDisponivel() {
        // Arrange
        KeyResolver resolver = rateLimiterConfig.ipKeyResolver();
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<String> keyMono = resolver.resolve(exchange);

        // Assert
        StepVerifier.create(keyMono)
                .expectNext("anonymous")
                .verifyComplete();
    }
}
