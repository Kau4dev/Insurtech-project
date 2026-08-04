package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.AprovarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroAprovadoEvent;
import com.insurtech.sinistros.application.usecase.AprovarSinistroUseCase;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.StatusInvalidoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.exception.ValorInvalidoException;
import com.insurtech.sinistros.domain.exception.DocumentoObrigatorioException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AprovarSinistroUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private ApoliceClient client;

    @Mock
    private EventPublisherPort eventPublisher;

    @InjectMocks
    private AprovarSinistroUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    private Sinistro criarSinistroValidoParaAprovacao(UUID apoliceId) {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setApoliceId(apoliceId);
        sinistro.setSeguradoId(UUID.randomUUID());
        sinistro.setStatus(Status.EM_ANALISE);
        sinistro.setAnalistaId(UUID.randomUUID());

        DocumentoSinistro doc = new DocumentoSinistro();
        doc.setId(UUID.randomUUID());
        sinistro.getDocumentos().add(doc);
        return sinistro;
    }

    @Test
    void deveAprovarSinistro_comSucesso_comoAnalista() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));
        ApoliceResponseDTO apoliceDTO = mock(ApoliceResponseDTO.class);
        when(apoliceDTO.valorPremio()).thenReturn(new BigDecimal("5000.00"));

        SinistroResponseDTO responseDTO = mock(SinistroResponseDTO.class);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenReturn(apoliceDTO);
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(id, dto);

        assertNotNull(resultado);
        assertEquals(Status.APROVADO, sinistro.getStatus());
        verify(repository, times(1)).salvar(sinistro);
        verify(eventPublisher, times(1)).publicarSinistroAprovado(any(SinistroAprovadoEvent.class));
    }

    @Test
    void deveAprovarSinistro_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));
        ApoliceResponseDTO apoliceDTO = mock(ApoliceResponseDTO.class);
        when(apoliceDTO.valorPremio()).thenReturn(new BigDecimal("5000.00"));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenReturn(apoliceDTO);
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(id, dto));
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        UUID id = UUID.randomUUID();
        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(id, dto));
        verifyNoInteractions(repository, client, mapper, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        UUID id = UUID.randomUUID();
        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(id, dto));
        verifyNoInteractions(repository, client, mapper, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));

        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(id, dto));
        verify(repository, times(1)).buscarPorId(id);
        verifyNoInteractions(client, mapper, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));
        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenThrow(exception);

        assertThrows(ApoliceNaoEncontradaException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoStatusInvalido() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);
        sinistro.setStatus(Status.REGISTRADO);

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));
        ApoliceResponseDTO apoliceDTO = mock(ApoliceResponseDTO.class);
        when(apoliceDTO.valorPremio()).thenReturn(new BigDecimal("5000.00"));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenReturn(apoliceDTO);

        assertThrows(StatusInvalidoException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoValorAprovadoMenorOuIgualAZero() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(BigDecimal.ZERO);
        ApoliceResponseDTO apoliceDTO = mock(ApoliceResponseDTO.class);
        when(apoliceDTO.valorPremio()).thenReturn(new BigDecimal("5000.00"));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenReturn(apoliceDTO);

        assertThrows(ValorInvalidoException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoValorAprovadoExcedeValorPremio() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("6000.00"));
        ApoliceResponseDTO apoliceDTO = mock(ApoliceResponseDTO.class);
        when(apoliceDTO.valorPremio()).thenReturn(new BigDecimal("5000.00"));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenReturn(apoliceDTO);

        assertThrows(ValorInvalidoException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoAprovarSemDocumentos() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        UUID id = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Sinistro sinistro = criarSinistroValidoParaAprovacao(apoliceId);
        sinistro.getDocumentos().clear();

        AprovarSinistroRequestDTO dto = new AprovarSinistroRequestDTO(new BigDecimal("1000.00"));
        ApoliceResponseDTO apoliceDTO = mock(ApoliceResponseDTO.class);
        when(apoliceDTO.valorPremio()).thenReturn(new BigDecimal("5000.00"));

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(client.buscarPorId(apoliceId)).thenReturn(apoliceDTO);

        assertThrows(DocumentoObrigatorioException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }
}