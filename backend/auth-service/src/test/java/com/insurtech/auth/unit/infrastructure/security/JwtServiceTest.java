package com.insurtech.auth.unit.infrastructure.security;

import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.infrastructure.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secretBase64 = "dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VmaWNpZW50bHktbG9uZy1zZWNyZXQta2V5LWZvci1qd3QtMjU2LWJpdHM=";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", secretBase64);
        ReflectionTestUtils.setField(jwtService, "expiration", expirationMs);
    }

    @Test
    void deveGerarETokenValido_comSucesso() {
        Usuario usuario = new Usuario();
        UUID userId = UUID.randomUUID();
        usuario.setId(userId);
        usuario.setEmail("test@email.com");
        usuario.setPapel(Papel.ADMIN);

        String token = jwtService.gerarToken(usuario);

        assertNotNull(token);
        assertTrue(jwtService.isTokenValido(token));
        assertEquals(userId, jwtService.extrairUsuarioId(token));
        assertEquals("ADMIN", jwtService.extrairPapel(token));
    }

    @Test
    void deveRetornarFalso_quandoTokenInvalidoOuNulo() {
        assertFalse(jwtService.isTokenValido("invalido"));
        assertFalse(jwtService.isTokenValido(""));
        assertFalse(jwtService.isTokenValido(null));
    }
}
