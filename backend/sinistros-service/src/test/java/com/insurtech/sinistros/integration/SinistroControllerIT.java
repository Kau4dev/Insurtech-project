package com.insurtech.sinistros.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.request.AprovarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.request.RejeitarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.*;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoDocumento;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.AuthClient;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.infrastructure.client.dto.Papel;
import com.insurtech.sinistros.infrastructure.client.dto.UsuarioResponseDTO;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class SinistroControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SinistroRepository repository;

    @MockitoBean
    private SeguradoClient seguradoClient;

    @MockitoBean
    private ApoliceClient apoliceClient;

    @MockitoBean
    private AuthClient authClient;

    // ─── POST /sinistros ──────────────────────────────────────────────────────

    @Test
    void deveCadastrarSinistro_comoAnalista_retornar201() {
        SinistroRequestDTO request = new SinistroRequestDTO(
                "SIN-123456", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.ROUBO_FURTO, "Roubo do veículo segurado",
                LocalDate.now().minusDays(2), new BigDecimal("15000.00")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros", HttpMethod.POST,
                new HttpEntity<>(request, headers), SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SIN-123456", response.getBody().numeroSinistro());
    }

    @Test
    void deveRetornar401_quandoCadastrarSinistroSemAutenticacao() {
        SinistroRequestDTO request = new SinistroRequestDTO(
                "SIN-NO-AUTH", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.COLISAO, "desc", LocalDate.now(), new BigDecimal("1000.00")
        );

        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                "/api/v1/sinistros", request, ErrorResponse.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoCadastrarSinistroComPapelSegurado() {
        SinistroRequestDTO request = new SinistroRequestDTO(
                "SIN-FORBIDDEN", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.COLISAO, "desc", LocalDate.now(), new BigDecimal("1000.00")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "SEGURADO");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros", HttpMethod.POST,
                new HttpEntity<>(request, headers), ErrorResponse.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ─── GET /sinistros ───────────────────────────────────────────────────────

    @Test
    void deveListarSinistros_comoGestor_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-LIST-GESTOR", Status.REGISTRADO);
        repository.salvar(sinistro);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<PageResponseDTO<SinistroResponseDTO>> response = restTemplate.exchange(
                "/api/v1/sinistros?size=10", HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<PageResponseDTO<SinistroResponseDTO>>() {}
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveListarSinistros_comoAnalista_retornarSomenteOsSeus() {
        UUID analistaId = UUID.randomUUID();
        Sinistro sinistro = createDummySinistro("SIN-LIST-ANALISTA", Status.REGISTRADO);
        sinistro.setAnalistaId(analistaId);
        repository.salvar(sinistro);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", analistaId.toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<PageResponseDTO<SinistroResponseDTO>> response = restTemplate.exchange(
                "/api/v1/sinistros?size=10", HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<PageResponseDTO<SinistroResponseDTO>>() {}
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // Todos os registros retornados devem pertencer ao analista logado
        response.getBody().content().forEach(s ->
                assertEquals(analistaId, s.analistaId())
        );
    }

    @Test
    void deveRetornar401_quandoListarSinistrosSemAutenticacao() {
        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros", HttpMethod.GET, null, ErrorResponse.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoListarSinistrosComPapelSegurado() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "SEGURADO");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros", HttpMethod.GET,
                new HttpEntity<>(headers), ErrorResponse.class
        );
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ─── GET /sinistros/{id} ─────────────────────────────────────────────────

    @Test
    void deveBuscarSinistroPorId_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-GET-BY-ID", Status.REGISTRADO);
        repository.salvar(sinistro);

        ResponseEntity<SinistroDetalhadoResponseDTO> response = restTemplate.getForEntity(
                "/api/v1/sinistros/" + sinistro.getId(),
                SinistroDetalhadoResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SIN-GET-BY-ID", response.getBody().numeroSinistro());
    }

    @Test
    void deveRetornar404_quandoSinistroNaoExiste() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/v1/sinistros/" + UUID.randomUUID(), String.class
        );
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // ─── PATCH /sinistros/{id}/atribuir ──────────────────────────────────────

    @Test
    void deveAtribuirAnalista_comoGestor_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-ATRIBUIR", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        UUID analistaId = UUID.randomUUID();
        when(authClient.buscarPorId(analistaId)).thenReturn(
                new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + analistaId,
                HttpMethod.PATCH, new HttpEntity<>(headers), SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(analistaId, response.getBody().analistaId());
        assertEquals(Status.EM_ANALISE, response.getBody().status());
    }

    @Test
    void deveAtribuirAnalista_comoAnalista_autoAtribuicao_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-AUTO-ATRIBUIR", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        UUID analistaId = UUID.randomUUID();
        when(authClient.buscarPorId(analistaId)).thenReturn(
                new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", analistaId.toString()); // o próprio analista se atribui
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + analistaId,
                HttpMethod.PATCH, new HttpEntity<>(headers), SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(analistaId, response.getBody().analistaId());
    }

    @Test
    void deveRetornar403_quandoAnalistaTentaAtribuirAOutro() {
        Sinistro sinistro = createDummySinistro("SIN-ATRIBUIR-OUTRO", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        UUID analistaLogado = UUID.randomUUID();
        UUID outroAnalista = UUID.randomUUID(); // diferente do logado

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", analistaLogado.toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + outroAnalista,
                HttpMethod.PATCH, new HttpEntity<>(headers), ErrorResponse.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Acesso negado. Analistas só podem se auto-atribuir a sinistros.", response.getBody().message());
    }

    @Test
    void deveRetornar401_quandoAtribuirAnalistaSemAutenticacao() {
        Sinistro sinistro = createDummySinistro("SIN-ATRIBUIR-401", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + UUID.randomUUID(),
                HttpMethod.PATCH, null, ErrorResponse.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Usuário não autenticado", response.getBody().message());
    }

    @Test
    void deveRetornar404_quandoAnalistaNaoEncontradoNoAuth() {
        Sinistro sinistro = createDummySinistro("SIN-ATRIBUIR-404", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        UUID analistaId = UUID.randomUUID();
        when(authClient.buscarPorId(analistaId)).thenThrow(feignNotFound());

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + analistaId,
                HttpMethod.PATCH, new HttpEntity<>(headers), ErrorResponse.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Analista não encontrado com o ID: " + analistaId, response.getBody().message());
    }

    @Test
    void deveRetornar400_quandoAnalistaTemPapelInvalido() {
        Sinistro sinistro = createDummySinistro("SIN-ATRIBUIR-400", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        UUID analistaId = UUID.randomUUID();
        when(authClient.buscarPorId(analistaId)).thenReturn(
                new UsuarioResponseDTO(analistaId, "Admin", "admin@email.com", Papel.ADMIN)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + analistaId,
                HttpMethod.PATCH, new HttpEntity<>(headers), ErrorResponse.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("O usuário informado não possui papel de analista (ANALISTA ou GESTOR)", response.getBody().message());
    }

    // ─── PATCH /sinistros/{id}/aprovar ────────────────────────────────────────

    @Test
    void deveAprovarSinistro_comoAnalista_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-APROVAR", Status.EM_ANALISE);
        addDummyDocument(sinistro);
        repository.salvar(sinistro);

        when(apoliceClient.buscarPorId(sinistro.getApoliceId())).thenReturn(
                new ApoliceResponseDTO(
                        sinistro.getApoliceId(), sinistro.getSeguradoId(), "AP-123", null,
                        new BigDecimal("100000.00"), new BigDecimal("100000.00"),
                        LocalDate.now(), LocalDate.now(), null, null, null, null
                )
        );

        AprovarSinistroRequestDTO request = new AprovarSinistroRequestDTO(new BigDecimal("12000.00"));

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/aprovar",
                HttpMethod.PATCH, new HttpEntity<>(request, headers), SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(Status.APROVADO, response.getBody().status());
        assertEquals(new BigDecimal("12000.00"), response.getBody().valorAprovado());
    }

    @Test
    void deveRetornar401_quandoAprovarSemAutenticacao() {
        Sinistro sinistro = createDummySinistro("SIN-APROVAR-401", Status.EM_ANALISE);
        repository.salvar(sinistro);

        AprovarSinistroRequestDTO request = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/aprovar",
                HttpMethod.PATCH, new HttpEntity<>(request), ErrorResponse.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoAprovarComPapelSegurado() {
        Sinistro sinistro = createDummySinistro("SIN-APROVAR-403", Status.EM_ANALISE);
        repository.salvar(sinistro);

        AprovarSinistroRequestDTO request = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "SEGURADO");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/aprovar",
                HttpMethod.PATCH, new HttpEntity<>(request, headers), ErrorResponse.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ─── PATCH /sinistros/{id}/rejeitar ───────────────────────────────────────

    @Test
    void deveRejeitarSinistro_comoAnalista_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-REJEITAR", Status.EM_ANALISE);
        addDummyDocument(sinistro);
        repository.salvar(sinistro);

        RejeitarSinistroRequestDTO request = new RejeitarSinistroRequestDTO("Documentos falsificados");

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/rejeitar",
                HttpMethod.PATCH, new HttpEntity<>(request, headers), SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(Status.REJEITADO, response.getBody().status());
        assertEquals("Documentos falsificados", response.getBody().motivoRejeicao());
    }

    @Test
    void deveRetornar401_quandoRejeitarSemAutenticacao() {
        Sinistro sinistro = createDummySinistro("SIN-REJEITAR-401", Status.EM_ANALISE);
        repository.salvar(sinistro);

        RejeitarSinistroRequestDTO request = new RejeitarSinistroRequestDTO("Motivo");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/rejeitar",
                HttpMethod.PATCH, new HttpEntity<>(request), ErrorResponse.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoRejeitarComPapelSegurado() {
        Sinistro sinistro = createDummySinistro("SIN-REJEITAR-403", Status.EM_ANALISE);
        repository.salvar(sinistro);

        RejeitarSinistroRequestDTO request = new RejeitarSinistroRequestDTO("Motivo");

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "SEGURADO");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/rejeitar",
                HttpMethod.PATCH, new HttpEntity<>(request, headers), ErrorResponse.class
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ─── GET /sinistros/dashboard/resumo ─────────────────────────────────────

    @Test
    void deveMostrarMetricasDashboard_comoGestor_retornar200() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "GESTOR");

        ResponseEntity<DashboardResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/dashboard/resumo", HttpMethod.GET,
                new HttpEntity<>(headers), DashboardResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveRetornar401_quandoDashboardSemAutenticacao() {
        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/dashboard/resumo", HttpMethod.GET,
                null, ErrorResponse.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar403_quandoDashboardComPapelAnalista() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Usuario-Id", UUID.randomUUID().toString());
        headers.set("X-Usuario-Papel", "ANALISTA");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/sinistros/dashboard/resumo", HttpMethod.GET,
                new HttpEntity<>(headers), ErrorResponse.class
        );
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ─── Demais endpoints ─────────────────────────────────────────────────────

    @Test
    void deveAguardarDocumentos_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-DOCS", Status.EM_ANALISE);
        repository.salvar(sinistro);

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/aguardar-documentos",
                HttpMethod.PATCH, null, SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(Status.AGUARDANDO_DOCUMENTOS, response.getBody().status());
    }

    @Test
    void deveAdicionarDocumento_retornar201() {
        Sinistro sinistro = createDummySinistro("SIN-ADD-DOC", Status.AGUARDANDO_DOCUMENTOS);
        repository.salvar(sinistro);

        AdicionarDocumentoRequestDTO request = new AdicionarDocumentoRequestDTO(
                TipoDocumento.BOLETIM_OCORRENCIA, "residencia.pdf", "http://storage/residencia.pdf"
        );

        ResponseEntity<DocumentoSinistroResponseDTO> response = restTemplate.postForEntity(
                "/api/v1/sinistros/" + sinistro.getId() + "/documentos", request, DocumentoSinistroResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("residencia.pdf", response.getBody().nomeArquivo());
    }

    @Test
    void deveMostrarHistorico_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-HISTORICO", Status.REGISTRADO);
        repository.salvar(sinistro);

        ResponseEntity<List<HistoricoSinistroResponseDTO>> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/historico",
                HttpMethod.GET, null,
                new ParameterizedTypeReference<List<HistoricoSinistroResponseDTO>>() {}
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private FeignException.NotFound feignNotFound() {
        return (FeignException.NotFound) FeignException.NotFound.errorStatus(
                "AuthClient#buscarPorId(UUID)",
                feign.Response.builder()
                        .status(404).reason("Not Found")
                        .request(Request.create(Request.HttpMethod.GET, "/api/v1/auth/usuarios",
                                Collections.emptyMap(), new byte[0], Charset.defaultCharset()))
                        .build()
        );
    }

    private Sinistro createDummySinistro(String numeroSinistro, Status status) {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setNumeroSinistro(numeroSinistro);
        sinistro.setApoliceId(UUID.randomUUID());
        sinistro.setSeguradoId(UUID.randomUUID());
        sinistro.setAnalistaId(UUID.randomUUID());
        sinistro.setTipoSinistro(TipoSinistro.ROUBO_FURTO);
        sinistro.setDescricao("Descrição dummy");
        sinistro.setDataOcorrencia(LocalDate.now().minusDays(1));
        sinistro.setValorEstimado(new BigDecimal("5000.00"));
        sinistro.setStatus(status);
        return sinistro;
    }

    private void addDummyDocument(Sinistro sinistro) {
        DocumentoSinistro doc = new DocumentoSinistro();
        doc.setId(UUID.randomUUID());
        doc.setSinistroId(sinistro.getId());
        doc.setTipoDocumento(TipoDocumento.BOLETIM_OCORRENCIA);
        doc.setNomeArquivo("boletim.pdf");
        doc.setUrlArquivo("http://storage/boletim.pdf");
        doc.setDataUpload(Instant.now());
        sinistro.getDocumentos().add(doc);
    }
}
