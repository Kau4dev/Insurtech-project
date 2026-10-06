package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.PageResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.ListarSinistrosUseCase;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.nio.charset.StandardCharsets;
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
    private ApoliceClient apoliceClient;

    @Mock
    private SinistroSecurityValidator securityValidator;

    @InjectMocks
    private ListarSinistrosUseCase useCase;

    private UserContext criarContexto(String usuarioId, String papel) {
        UserContext ctx = new UserContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
        return ctx;
    }

    @Test
    void deveListarSinistros_comSucesso_comoGestor() {
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        when(repository.listar(any(), any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar(null, null, null, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
    }

    @Test
    void deveListarSinistros_comoAnalista_forcaFiltroAnalistaId() {
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(analistaId.toString(), "ANALISTA"));

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        when(repository.listar(any(), any(), any(), eq(analistaId), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar(null, null, null, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        verify(repository).listar(any(), any(), any(), eq(analistaId), any(), any(), any(), any(), any());
    }

    @Test
    void deveListarSinistros_comSucesso_comoSeguradoDono() {
        UUID usuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(usuarioId.toString(), "SEGURADO"));

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        when(repository.listar(any(), any(), eq(seguradoId), any(), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar(null, null, seguradoId, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
        verify(securityValidator).validarPropriedadeSegurado(eq(seguradoId), anyString());
    }

    @Test
    void deveLancarExcecao_quandoValidatorRecusaSegurado() {
        UUID usuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(usuarioId.toString(), "SEGURADO"));

        doThrow(new AcessoNegadoException("Acesso negado. Você só pode visualizar seus próprios sinistros."))
                .when(securityValidator).validarPropriedadeSegurado(eq(seguradoId), anyString());

        assertThrows(AcessoNegadoException.class,
                () -> useCase.executar(null, null, seguradoId, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository);
    }

    @Test
    void deveListarSinistros_comFiltrosSeguradoEApoliceEncontrados_comoGestor() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        Page<Sinistro> page = new PageImpl<>(List.of(new Sinistro()));
        when(repository.listar(any(), any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(page);
        when(mapper.toResponse(any(Sinistro.class))).thenReturn(mock(SinistroResponseDTO.class));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);

        PageResponseDTO<SinistroResponseDTO> resultado = useCase.executar("SIN-2026-0001", apoliceId, seguradoId, null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
        verify(securityValidator).validarExistenciaSegurado(seguradoId);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        doThrow(new UsuarioNaoAutenticadoException("Usuário não autenticado"))
                .when(securityValidator).validarPapeis(anyString(), any(), any(), any(), any());

        assertThrows(UsuarioNaoAutenticadoException.class,
                () -> useCase.executar(null, null, null, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository, apoliceClient);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        doThrow(new AcessoNegadoException("Acesso negado."))
                .when(securityValidator).validarPapeis(anyString(), any(), any(), any(), any());

        assertThrows(AcessoNegadoException.class,
                () -> useCase.executar(null, null, null, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository, apoliceClient);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontrado_comoGestor() {
        UUID seguradoId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        doThrow(new SeguradoNaoEncontradoException("Segurado não encontrado: " + seguradoId))
                .when(securityValidator).validarExistenciaSegurado(seguradoId);

        assertThrows(SeguradoNaoEncontradoException.class,
                () -> useCase.executar(null, null, seguradoId, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(apoliceClient, repository);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), any(), any(), any(), any()))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, StandardCharsets.UTF_8, new RequestTemplate());
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(apoliceClient.buscarPorId(apoliceId)).thenThrow(exception);

        assertThrows(ApoliceNaoEncontradaException.class,
                () -> useCase.executar(null, apoliceId, seguradoId, null, null, null, null, null, PageRequest.of(0, 10)));
        verifyNoInteractions(repository);
    }
}
