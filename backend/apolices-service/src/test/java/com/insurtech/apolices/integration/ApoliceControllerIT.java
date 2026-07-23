package com.insurtech.apolices.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.infrastructure.client.dto.SeguradoResponseDTO;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.infrastructure.client.SeguradoClient;
import com.insurtech.apolices.infrastructure.client.dto.TipoPessoa;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class ApoliceControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SeguradoClient seguradoClient;

    @Test
    void deveCadastrarApolice_retornar201() {

        UUID seguradoId = UUID.randomUUID();

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(
                new SeguradoResponseDTO(seguradoId, TipoPessoa.PF, "João Silva", "123", "a@a", "11", LocalDate.now(), null, null, null, null, null,  null)
        );

        String numeroUnico = "IT-" + UUID.randomUUID().toString().substring(0, 8);
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId,
                numeroUnico,
                TipoSeguro.VIDA,
                new BigDecimal("50000.00"),
                new BigDecimal("150.00"),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                null
        );

        ResponseEntity<ApoliceResponseDTO> response = restTemplate.postForEntity(
                "/api/v1/apolices", dto, ApoliceResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(numeroUnico, response.getBody().numeroApolice());
    }

    @Test
    void deveRetornar400_quandoPayloadInvalido() {
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                null,
                "IT-12345",
                TipoSeguro.VIDA,
                null,
                new BigDecimal("150.00"),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                null
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/apolices", dto, String.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deveRetornar404_quandoApoliceNaoExistePorId() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/v1/apolices/" + UUID.randomUUID(), String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deveRetornar409_quandoApoliceJaCadastrada() {
        UUID seguradoId = UUID.randomUUID();

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(
                new SeguradoResponseDTO(seguradoId, TipoPessoa.PF, "João Silva", "123", "a@a", "11", LocalDate.now(), null, null, null, null, null, null)
        );

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId,
                "IT-" + UUID.randomUUID().toString().substring(0, 8),
                TipoSeguro.VIDA,
                new BigDecimal("50000.00"),
                new BigDecimal("150.00"),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                null
        );

        restTemplate.postForEntity(
                "/api/v1/apolices", dto, ApoliceResponseDTO.class
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/apolices", dto, String.class
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }
}
