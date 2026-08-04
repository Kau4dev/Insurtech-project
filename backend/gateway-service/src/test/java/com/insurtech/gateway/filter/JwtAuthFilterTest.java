package com.insurtech.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    private JwtAuthFilter filter;

    @Mock
    private GatewayFilterChain chain;

    private final String SECRET = "dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VmaWNpZW50bHktbG9uZy1zZWNyZXQta2V5LWZvci1qd3QtMjU2LWJpdHM=";

    @BeforeEach
    void setUp() {
        filter = new JwtAuthFilter();
        ReflectionTestUtils.setField(filter, "jwtSecret", SECRET);
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

    @ParameterizedTest
    @ValueSource(strings = {
            "/api/v1/auth/login",
            "/actuator/health",
            "/v3/api-docs",
            "/swagger-ui/index.html"
    })
    void devePermitirRotaPublicaSemToken(String rotaPublica) {
        // Arrange
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        MockServerHttpRequest request = MockServerHttpRequest.get(rotaPublica).build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<Void> result = filter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result).verifyComplete();
        verify(chain).filter(exchange);
    }

    @Test
    void deveBloquearRequisicaoSemHeaderAuthorization() {
        // Arrange
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/sinistros").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<Void> result = filter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verifyNoInteractions(chain);
    }

    @Test
    void deveBloquearRequisicaoComHeaderMalformado() {
        // Arrange
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/sinistros")
                .header("Authorization", "InvalidPrefix token123")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<Void> result = filter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verifyNoInteractions(chain);
    }

    @Test
    void deveBloquearRequisicaoComTokenInvalido() {
        // Arrange
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/sinistros")
                .header("Authorization", "Bearer token-invalido")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<Void> result = filter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verifyNoInteractions(chain);
    }

    @Test
    void deveBloquearRequisicaoComTokenExpirado() {
        // Arrange
        String tokenExpirado = gerarToken("123", "ANALISTA", -1000L);
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/sinistros")
                .header("Authorization", "Bearer " + tokenExpirado)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<Void> result = filter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verifyNoInteractions(chain);
    }

    @Test
    void devePropagarHeadersQuandoTokenForValido() {
        // Arrange
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        String tokenValido = gerarToken("user-789", "GESTOR", 60000L);
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/sinistros")
                .header("Authorization", "Bearer " + tokenValido)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act
        Mono<Void> result = filter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result).verifyComplete();

        ArgumentCaptor<ServerWebExchange> exchangeCaptor = ArgumentCaptor.forClass(ServerWebExchange.class);
        verify(chain).filter(exchangeCaptor.capture());

        ServerWebExchange mutatedExchange = exchangeCaptor.getValue();
        assertEquals("user-789", mutatedExchange.getRequest().getHeaders().getFirst("X-Usuario-Id"));
        assertEquals("GESTOR", mutatedExchange.getRequest().getHeaders().getFirst("X-Usuario-Papel"));
    }
}
