package com.insurtech.segurados.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.model.Uf;
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

    // ─── POST /segurados ─────────────────────────────────────────────────────

    @Test
    void deveCadastrarSegurado_comoGestor_retornar201() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<SeguradoResponseDTO> response = restTemplate.exchange(
                "/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(dto, headers), SeguradoResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void deveCadastrarSegurado_comoAdmin_retornar201() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "Maria Admin", "11122233344",
                "maria@email.com", "11987654321",
                LocalDate.of(1985, 3, 10),
                null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ADMIN");

        ResponseEntity<SeguradoResponseDTO> response = restTemplate.exchange(
                "/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(dto, headers), SeguradoResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void deveRetornar401_quandoCadastrarSeguradoSemAutenticacao() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "99988877766",
                "joao3@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/segurados", dto, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoCadastrarSeguradoComPapelAnalista() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "55544433322",
                "joao2@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void deveRetornar409_quandoCpfCnpjDuplicado() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "10000000001",
                "joao.dup@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        restTemplate.exchange("/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void deveRetornar400_quandoPayloadInvalido() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "20000000002",
                "joao.inv@email.com", null,
                null, // ← data de nascimento nula para PF
                null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ─── GET /segurados ───────────────────────────────────────────────────────

    @Test
    void deveRetornar404_quandoSeguradoNaoExiste() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados/" + UUID.randomUUID(), HttpMethod.GET,
                new HttpEntity<>(headers), String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // ─── PUT /segurados/{id} ─────────────────────────────────────────────────

    @Test
    void deveAtualizarSegurado_comoGestor_retornar200() {
        // Primeiro cadastra como GESTOR
        SeguradoRequestDTO createDto = new SeguradoRequestDTO(
                TipoPessoa.PF, "Carlos Original", "30000000003",
                "carlos@email.com", "11911110000",
                LocalDate.of(1980, 1, 1),
                null, null, null, null
        );
        HttpHeaders gestorHeaders = new HttpHeaders();
        gestorHeaders.set("X-Usuario-Id", UUID.randomUUID().toString());
        gestorHeaders.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<SeguradoResponseDTO> created = restTemplate.exchange(
                "/api/v1/segurados", HttpMethod.POST,
                new HttpEntity<>(createDto, gestorHeaders), SeguradoResponseDTO.class
        );
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        UUID seguradoId = created.getBody().id();

        // Agora atualiza como GESTOR
        SeguradoUpdateDTO updateDto = new SeguradoUpdateDTO(
                "Carlos Atualizado", "carlos.new@email.com", "11922220000",
                LocalDate.of(1980, 1, 1), null, null, Uf.SP, null
        );

        ResponseEntity<SeguradoResponseDTO> response = restTemplate.exchange(
                "/api/v1/segurados/" + seguradoId, HttpMethod.PUT,
                new HttpEntity<>(updateDto, gestorHeaders), SeguradoResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Carlos Atualizado", response.getBody().nomeRazaoSocial());
    }

    @Test
    void deveRetornar401_quandoAtualizarSeguradoSemAutenticacao() {
        SeguradoUpdateDTO dto = new SeguradoUpdateDTO(
                "Nome", "email@email.com", null, null, null, null, null, null
        );

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados/" + UUID.randomUUID(), HttpMethod.PUT,
                new HttpEntity<>(dto), String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoAtualizarSeguradoComPapelAnalista() {
        SeguradoUpdateDTO dto = new SeguradoUpdateDTO(
                "Nome", "email@email.com", null, null, null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados/" + UUID.randomUUID(), HttpMethod.PUT,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoAtualizarSeguradoComPapelSegurado() {
        SeguradoUpdateDTO dto = new SeguradoUpdateDTO(
                "Nome", "email@email.com", null, null, null, null, null, null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "SEGURADO");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/segurados/" + UUID.randomUUID(), HttpMethod.PUT,
                new HttpEntity<>(dto, headers), String.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
}