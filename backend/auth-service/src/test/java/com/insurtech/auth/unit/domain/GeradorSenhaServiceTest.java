package com.insurtech.auth.unit.domain;

import com.insurtech.auth.domain.service.GeradorSenhaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class GeradorSenhaServiceTest {

    private final GeradorSenhaService service = new GeradorSenhaService();

    @Test
    @DisplayName("Deve gerar senha segura com 12 caracteres contendo maiúsculas, minúsculas, números e símbolos")
    void deveGerarSenhaComDozeCaracteresEntropicos() {
        String senha = service.gerarSenhaSegura();

        assertEquals(12, senha.length());
        assertTrue(senha.matches(".*[A-Z].*"), "deve conter letra maiúscula");
        assertTrue(senha.matches(".*[a-z].*"), "deve conter letra minúscula");
        assertTrue(senha.matches(".*\\d.*"), "deve conter dígito");
        assertTrue(senha.matches(".*[!@#$%&*\\-_+=?].*"), "deve conter símbolo");
    }

    @Test
    @DisplayName("Deve gerar senhas distintas com alta entropia em chamadas sucessivas")
    void deveGerarSenhasDiferentesEmChamadasSucessivas() {
        Set<String> geradas = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            geradas.add(service.gerarSenhaSegura());
        }
        assertTrue(geradas.size() > 90, "100 chamadas devem gerar senhas majoritariamente distintas");
    }
}