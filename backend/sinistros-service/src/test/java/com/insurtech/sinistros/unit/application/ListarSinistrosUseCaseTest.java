package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.PageResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.ListarSinistrosUseCase;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListarSinistrosUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private SeguradoClient seguradoClient;

    @Mock
    private ApoliceClient apoliceClient;

    @InjectMocks
    private ListarSinistrosUseCase useCase;

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
    void deveListarSinistros_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        when(repository.listar(any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar(null, null, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
    }

    @Test
    void deveListarSinistros_comoAnalista_forçaFiltroAnalistaId() {
        UUID analistaId = UUID.randomUUID();
        setUserContext(analistaId.toString(), "ANALISTA");

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        // O analistaId passado pelo caller (null) deve ser sobrescrito pelo usuarioId
        when(repository.listar(any(), any(), eq(analistaId), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar(null, null, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        // Verifica que o analistaId foi fixado no UUID do usuário logado
        verify(repository).listar(any(), any(), eq(analistaId), any(), any(), any(), any(), any());
    }

    @Test
    void deveListarSinistros_comFiltrosSeguradoEApoliceEncontrados() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        when(repository.listar(any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar(apoliceId, seguradoId, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        // Contexto vazio
        assertThrows(UsuarioNaoAutenticadoException.class,
                () -> useCase.executar(null, null, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository, seguradoClient, apoliceClient);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        assertThrows(AcessoNegadoException.class,
                () -> useCase.executar(null, null, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository, seguradoClient, apoliceClient);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontrado() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(seguradoClient.buscarPorId(seguradoId)).thenThrow(exception);

        assertThrows(SeguradoNaoEncontradoException.class,
                () -> useCase.executar(null, seguradoId, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(apoliceClient, repository);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(null);
        when(apoliceClient.buscarPorId(apoliceId)).thenThrow(exception);

        assertThrows(ApoliceNaoEncontradaException.class,
                () -> useCase.executar(apoliceId, seguradoId, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository);
    }
}
