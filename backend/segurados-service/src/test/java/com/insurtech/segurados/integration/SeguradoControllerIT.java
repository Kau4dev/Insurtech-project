package com.insurtech.segurados.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.domain.model.TipoPessoa;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SeguradoControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void deveCadastrarSegurado_retornar201() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/segurados", dto, String.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void deveRetornar409_quandoCpfCnpjDuplicado() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        restTemplate.postForEntity("/api/v1/segurados", dto, String.class);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/segurados", dto, String.class
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void deveRetornar404_quandoSeguradoNaoExiste() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/v1/segurados/" + UUID.randomUUID(), String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deveRetornar400_quandoPayloadInvalido() {

        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", null,
                null, // ← data de nascimento nula para PF
                null, null, null, null
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/segurados", dto, String.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}