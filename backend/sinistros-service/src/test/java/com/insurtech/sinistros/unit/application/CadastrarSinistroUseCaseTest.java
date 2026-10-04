package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.CadastrarSinistroUseCase;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceInvalidaException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.DataOcorrenciaInvalidaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistrojaCadastradaException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CadastrarSinistroUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private SeguradoClient seguradoClient;

    @Mock
    private ApoliceClient apoliceClient;

    @Mock
    private EventPublisherPort eventPublisher;

    @InjectMocks
    private CadastrarSinistroUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    @Test
    void deveCadastrarSinistro_comSucesso_comoAnalista() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345",
                apoliceId,
                seguradoId,
                TipoSinistro.COLISAO,
                "Batida de carro",
                LocalDate.now(),
                new BigDecimal("5000.00")
        );

        Sinistro sinistro = new Sinistro();
        UUID sinistroId = UUID.randomUUID();
        sinistro.setId(sinistroId);
        sinistro.setSeguradoId(seguradoId);
        sinistro.setNumeroSinistro("SIN-12345");

        SinistroResponseDTO responseDTO = new SinistroResponseDTO(
                sinistroId, "SIN-12345", apoliceId, seguradoId,
                null, TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00"),
                null, Status.REGISTRADO, null, Instant.now(), Instant.now()
        );

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));
        when(repository.buscarPorNumero("SIN-12345")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(sinistro);
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertEquals("SIN-12345", resultado.numeroSinistro());
        assertEquals(Status.REGISTRADO, resultado.status());
        verify(repository, times(1)).salvar(any());
        verify(eventPublisher, times(1)).publicarSinistroRegistrado(any(SinistroRegistradoEvent.class));
    }

    @Test
    void deveCadastrarSinistro_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-GESTOR",
                apoliceId, seguradoId,
                TipoSinistro.COLISAO, "desc",
                LocalDate.now(), new BigDecimal("1000.00")
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setSeguradoId(seguradoId);
        sinistro.setNumeroSinistro("SIN-GESTOR");

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));
        when(repository.buscarPorNumero("SIN-GESTOR")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(sinistro);
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(dto));
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        // Contexto vazio — usuarioId null
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-AUTH", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.COLISAO, "desc", LocalDate.now(), new BigDecimal("1000.00")
        );

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, seguradoClient, apoliceClient, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-403", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.COLISAO, "desc", LocalDate.now(), new BigDecimal("1000.00")
        );

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, seguradoClient, apoliceClient, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontrado() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00")
        );

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(seguradoClient.buscarPorId(seguradoId)).thenThrow(exception);

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00")
        );

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenThrow(exception);

        assertThrows(ApoliceNaoEncontradaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoSinistroJaCadastrado() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00")
        );

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));
        when(repository.buscarPorNumero("SIN-12345")).thenReturn(Optional.of(new Sinistro()));

        assertThrows(SinistrojaCadastradaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoDataOcorrenciaAnteriorAoInicioDaVigencia() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        // Ocorrência em 21/09/2026, mas vigência inicia em 01/10/2026
        LocalDate dataOcorrencia = LocalDate.of(2026, 9, 21);
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-VIGENCIA-1", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida antes da vigência",
                dataOcorrencia, new BigDecimal("3000.00")
        );

        ApoliceResponseDTO apolice = new ApoliceResponseDTO(
                apoliceId, seguradoId, "AP-1020-9090",
                null, new BigDecimal("50000.00"), new BigDecimal("1000.00"),
                LocalDate.of(2026, 10, 1), LocalDate.of(2027, 10, 1),
                null, Collections.emptyList(), Instant.now(), Instant.now()
        );

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apolice);

        DataOcorrenciaInvalidaException ex = assertThrows(
                DataOcorrenciaInvalidaException.class,
                () -> useCase.executar(dto)
        );

        assertTrue(ex.getMessage().contains("Data do ocorrido anterior ao início da vigência da apólice"));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoDataOcorrenciaPosteriorAoFimDaVigencia() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        // Ocorrência em 15/02/2025, mas vigência terminou em 01/01/2025
        LocalDate dataOcorrencia = LocalDate.of(2025, 2, 15);
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-VIGENCIA-2", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida após a vigência",
                dataOcorrencia, new BigDecimal("3000.00")
        );

        ApoliceResponseDTO apolice = new ApoliceResponseDTO(
                apoliceId, seguradoId, "AP-1020-9090",
                null, new BigDecimal("50000.00"), new BigDecimal("1000.00"),
                LocalDate.of(2024, 1, 1), LocalDate.of(2025, 1, 1),
                null, Collections.emptyList(), Instant.now(), Instant.now()
        );

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apolice);

        DataOcorrenciaInvalidaException ex = assertThrows(
                DataOcorrenciaInvalidaException.class,
                () -> useCase.executar(dto)
        );

        assertTrue(ex.getMessage().contains("Data do ocorrido posterior ao término da vigência da apólice"));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    private ApoliceResponseDTO apoliceValida(UUID apoliceId, UUID seguradoId) {
        return apolice(apoliceId, seguradoId, com.insurtech.sinistros.infrastructure.client.dto.Status.ATIVA);
    }

    private ApoliceResponseDTO apolice(UUID apoliceId, UUID seguradoId,
                                       com.insurtech.sinistros.infrastructure.client.dto.Status status) {
        return new ApoliceResponseDTO(
                apoliceId, seguradoId, "AP-1",
                null, new BigDecimal("50000.00"), new BigDecimal("1000.00"),
                LocalDate.now().minusYears(1), LocalDate.now().plusYears(1),
                status, Collections.emptyList(), Instant.now(), Instant.now()
        );
    }

    private SinistroRequestDTO dtoPadrao(UUID apoliceId, UUID seguradoId, LocalDate data) {
        return new SinistroRequestDTO(
                "SIN-X", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "desc", data, new BigDecimal("1000.00")
        );
    }

    @Test
    void deveLancarExcecao_quandoApoliceRetornarNula() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);

        assertThrows(ApoliceNaoEncontradaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now())));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoPertenceAoSegurado() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, UUID.randomUUID()));

        assertThrows(ApoliceInvalidaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now())));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEstiverAtiva() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(
                apolice(apoliceId, seguradoId, com.insurtech.sinistros.infrastructure.client.dto.Status.CANCELADA));

        assertThrows(ApoliceInvalidaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now())));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoDataOcorrenciaFutura() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));

        DataOcorrenciaInvalidaException ex = assertThrows(DataOcorrenciaInvalidaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now().plusDays(1))));
        assertTrue(ex.getMessage().contains("futura"));
        verify(repository, never()).salvar(any());
    }
}