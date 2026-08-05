package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.CadastrarSinistroUseCase;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistrojaCadastradaException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
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
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);
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
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);
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
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);
        when(repository.buscarPorNumero("SIN-12345")).thenReturn(Optional.of(new Sinistro()));

        assertThrows(SinistrojaCadastradaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }
}