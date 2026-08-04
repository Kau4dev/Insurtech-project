package com.insurtech.apolices.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.AtualizarStatusApoliceDTO;
import com.insurtech.apolices.application.dto.CoberturaRequestDTO;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoCobertura;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.infrastructure.client.SeguradoClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ApoliceControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SeguradoClient seguradoClient;

    // ─── POST /apolices ──────────────────────────────────────────────────────

    @Test
    void deveCadastrarApolice_comoGestor_retornar201() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-001", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ApoliceResponseDTO> response = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), ApoliceResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("IT-TEST-001", response.getBody().numeroApolice());
        assertEquals(Status.ATIVA, response.getBody().status());
    }

    @Test
    void deveCadastrarApolice_comoAdmin_retornar201() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-ADMIN", TipoSeguro.AUTO,
                new BigDecimal("50000.00"), new BigDecimal("200.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ADMIN");

        ResponseEntity<ApoliceResponseDTO> response = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), ApoliceResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void deveRetornar401_quandoCadastrarApoliceSemAutenticacao() {
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                UUID.randomUUID(), "IT-TEST-401", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/apolices", dto, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoCadastrarApoliceComPapelAnalista() {
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                UUID.randomUUID(), "IT-TEST-403-ANALISTA", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void deveCadastrarApolice_comCoberturas_retornar201() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        CoberturaRequestDTO cobertura = new CoberturaRequestDTO(
                TipoCobertura.ROUBO_FURTO, new BigDecimal("30000.00"), new BigDecimal("2000.00")
        );

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-002", TipoSeguro.AUTO,
                new BigDecimal("50000.00"), new BigDecimal("200.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), List.of(cobertura)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ApoliceResponseDTO> response = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), ApoliceResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().coberturas());
        assertFalse(response.getBody().coberturas().isEmpty());
    }

    @Test
    void deveRetornar404_quandoSeguradoNaoExiste() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenThrow(
                new feign.FeignException.NotFound("Not Found",
                        feign.Request.create(feign.Request.HttpMethod.GET, "/api/v1/segurados/" + seguradoId,
                                java.util.Collections.emptyMap(), null, null, null),
                        null, null)
        );

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-003", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deveRetornar409_quandoApoliceJaExiste() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-DUP", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        restTemplate.exchange("/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    // ─── GET /apolices/{id} ──────────────────────────────────────────────────

    @Test
    void deveBuscarApolicePorId_retornar200() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-BUSCAR", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ApoliceResponseDTO> created = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(dto, headers), ApoliceResponseDTO.class
        );

        UUID apoliceId = created.getBody().id();

        ResponseEntity<ApoliceResponseDTO> response = restTemplate.getForEntity(
                "/api/v1/apolices/" + apoliceId, ApoliceResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("IT-TEST-BUSCAR", response.getBody().numeroApolice());
    }

    @Test
    void deveRetornar404_quandoApoliceNaoExiste() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/v1/apolices/" + UUID.randomUUID(), String.class
        );
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // ─── PATCH /apolices/{id}/status ─────────────────────────────────────────

    @Test
    void deveCancelarApolice_comoGestor_retornar200() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        ApoliceRequestDTO createDto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-CANCELAR", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ApoliceResponseDTO> created = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(createDto, headers), ApoliceResponseDTO.class
        );

        UUID apoliceId = created.getBody().id();
        AtualizarStatusApoliceDTO statusDto = new AtualizarStatusApoliceDTO(Status.CANCELADA);

        ResponseEntity<ApoliceResponseDTO> response = restTemplate.exchange(
                "/api/v1/apolices/" + apoliceId + "/status", HttpMethod.PATCH,
                new HttpEntity<>(statusDto, headers), ApoliceResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Status.CANCELADA, response.getBody().status());
    }

    @Test
    void deveRetornar401_quandoAtualizarStatusSemAutenticacao() {
        AtualizarStatusApoliceDTO statusDto = new AtualizarStatusApoliceDTO(Status.CANCELADA);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/apolices/" + UUID.randomUUID() + "/status", HttpMethod.PATCH,
                new HttpEntity<>(statusDto), String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoAtualizarStatusComPapelAnalista() {
        AtualizarStatusApoliceDTO statusDto = new AtualizarStatusApoliceDTO(Status.CANCELADA);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/apolices/" + UUID.randomUUID() + "/status", HttpMethod.PATCH,
                new HttpEntity<>(statusDto, headers), String.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void deveRetornar400_quandoStatusNaoSuportado() {
        UUID seguradoId = UUID.randomUUID();
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);

        ApoliceRequestDTO createDto = new ApoliceRequestDTO(
                seguradoId, "IT-TEST-BAD-STATUS", TipoSeguro.VIDA,
                new BigDecimal("100000.00"), new BigDecimal("500.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ApoliceResponseDTO> created = restTemplate.exchange(
                "/api/v1/apolices", HttpMethod.POST,
                new HttpEntity<>(createDto, headers), ApoliceResponseDTO.class
        );

        UUID apoliceId = created.getBody().id();
        AtualizarStatusApoliceDTO statusDto = new AtualizarStatusApoliceDTO(Status.EXPIRADA);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/apolices/" + apoliceId + "/status", HttpMethod.PATCH,
                new HttpEntity<>(statusDto, headers), String.class
        );

            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
