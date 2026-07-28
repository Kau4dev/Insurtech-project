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
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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

    @Test
    void deveCadastrarSinistro_retornar201() {
        SinistroRequestDTO request = new SinistroRequestDTO(
                "SIN-123456",
                UUID.randomUUID(),
                UUID.randomUUID(),
                TipoSinistro.ROUBO_FURTO,
                "Roubo do veículo segurado",
                LocalDate.now().minusDays(2),
                new BigDecimal("15000.00")
        );

        ResponseEntity<SinistroResponseDTO> response = restTemplate.postForEntity(
                "/api/v1/sinistros",
                request,
                SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        SinistroResponseDTO responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals("SIN-123456", responseBody.numeroSinistro());
        assertEquals(TipoSinistro.ROUBO_FURTO, responseBody.tipoSinistro());
        assertEquals(new BigDecimal("15000.00"), responseBody.valorEstimado());
    }

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
                "/api/v1/sinistros/" + UUID.randomUUID(),
                String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deveListarSinistros_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-LIST-TEST", Status.REGISTRADO);
        repository.salvar(sinistro);

        ResponseEntity<PageResponseDTO<SinistroResponseDTO>> response = restTemplate.exchange(
                "/api/v1/sinistros?size=10",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<PageResponseDTO<SinistroResponseDTO>>() {}
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        org.junit.jupiter.api.Assertions.assertTrue(response.getBody().content().size() >= 1);
    }

    @Test
    void deveAtribuirAnalista_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-ATRIBUIR", Status.REGISTRADO);
        sinistro.setAnalistaId(null);
        repository.salvar(sinistro);

        UUID analistaId = UUID.randomUUID();

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/atribuir?analistaId=" + analistaId,
                HttpMethod.PATCH,
                null,
                SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(analistaId, response.getBody().analistaId());
        assertEquals(Status.EM_ANALISE, response.getBody().status());
    }

    @Test
    void deveAguardarDocumentos_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-DOCS", Status.EM_ANALISE);
        repository.salvar(sinistro);

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/aguardar-documentos",
                HttpMethod.PATCH,
                null,
                SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(Status.AGUARDANDO_DOCUMENTOS, response.getBody().status());
    }

    @Test
    void deveAprovarSinistro_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-APROVAR", Status.EM_ANALISE);
        addDummyDocument(sinistro);
        repository.salvar(sinistro);

        when(apoliceClient.buscarPorId(sinistro.getApoliceId())).thenReturn(
                new ApoliceResponseDTO(
                        sinistro.getApoliceId(),
                        sinistro.getSeguradoId(),
                        "AP-123",
                        null,
                        new BigDecimal("100000.00"),
                        new BigDecimal("100000.00"),
                        LocalDate.now(),
                        LocalDate.now(),
                        null,
                        null,
                        null,
                        null
                )
        );

        AprovarSinistroRequestDTO request = new AprovarSinistroRequestDTO(new BigDecimal("12000.00"));

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/aprovar",
                HttpMethod.PATCH,
                new HttpEntity<>(request),
                SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(Status.APROVADO, response.getBody().status());
        assertEquals(new BigDecimal("12000.00"), response.getBody().valorAprovado());
    }

    @Test
    void deveRejeitarSinistro_retornar200() {
        Sinistro sinistro = createDummySinistro("SIN-REJEITAR", Status.EM_ANALISE);
        addDummyDocument(sinistro);
        repository.salvar(sinistro);

        RejeitarSinistroRequestDTO request = new RejeitarSinistroRequestDTO("Documentos falsificados");

        ResponseEntity<SinistroResponseDTO> response = restTemplate.exchange(
                "/api/v1/sinistros/" + sinistro.getId() + "/rejeitar",
                HttpMethod.PATCH,
                new HttpEntity<>(request),
                SinistroResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(Status.REJEITADO, response.getBody().status());
        assertEquals("Documentos falsificados", response.getBody().motivoRejeicao());
    }

    @Test
    void deveAdicionarDocumento_retornar201() {
        Sinistro sinistro = createDummySinistro("SIN-ADD-DOC", Status.AGUARDANDO_DOCUMENTOS);
        repository.salvar(sinistro);

        AdicionarDocumentoRequestDTO request = new AdicionarDocumentoRequestDTO(
                TipoDocumento.BOLETIM_OCORRENCIA,
                "residencia.pdf",
                "http://storage/residencia.pdf"
        );

        ResponseEntity<DocumentoSinistroResponseDTO> response = restTemplate.postForEntity(
                "/api/v1/sinistros/" + sinistro.getId() + "/documentos",
                request,
                DocumentoSinistroResponseDTO.class
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
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<HistoricoSinistroResponseDTO>>() {}
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void deveMostrarMetricasDashboard_retornar200() {
        ResponseEntity<DashboardResponseDTO> response = restTemplate.getForEntity(
                "/api/v1/sinistros/dashboard/resumo",
                DashboardResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
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
