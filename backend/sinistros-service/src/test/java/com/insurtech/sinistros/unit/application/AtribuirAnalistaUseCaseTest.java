package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.AtribuirAnalistaUseCase;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.AnalistaInvalidoException;
import com.insurtech.sinistros.domain.exception.AnalistaNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.StatusInvalidoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.AuthClient;
import com.insurtech.sinistros.infrastructure.client.dto.Papel;
import com.insurtech.sinistros.infrastructure.client.dto.UsuarioResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.Charset;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtribuirAnalistaUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private AuthClient authClient;

    @Mock
    private SinistroSecurityValidator securityValidator;

    @InjectMocks
    private AtribuirAnalistaUseCase useCase;

    private UserContext criarContexto(String usuarioId, String papel) {
        UserContext ctx = new UserContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
        return ctx;
    }

    @Test
    void deveAtribuirAnalista_comoGestor_comSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO);

        SinistroResponseDTO responseDTO = mock(SinistroResponseDTO.class);

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(sinistroId, analistaId);

        assertNotNull(resultado);
        assertEquals(Status.EM_ANALISE, sinistro.getStatus());
        assertEquals(analistaId, sinistro.getAnalistaId());
        verify(authClient, times(1)).buscarPorId(analistaId);
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, times(1)).salvar(sinistro);
        verify(mapper, times(1)).toResponse(sinistro);
    }

    @Test
    void deveAtribuirAnalista_comoAdmin_comSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "ADMIN"));

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO);

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(sinistroId, analistaId));
    }

    @Test
    void deveAtribuirAnalista_comoAnalista_autoAtribuicao_comSucesso() {
        UUID analistaId = UUID.randomUUID();
        UUID sinistroId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(analistaId.toString(), "ANALISTA"));

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO);

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(sinistroId, analistaId));
    }

    @Test
    void deveLancarExcecao_quandoAnalistaTentaAtribuirAOutroAnalista() {
        UUID analistaLogadoId = UUID.randomUUID();
        UUID outroAnalistaId = UUID.randomUUID();
        UUID sinistroId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(analistaLogadoId.toString(), "ANALISTA"));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(sinistroId, outroAnalistaId));
        verifyNoInteractions(authClient, repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        doThrow(new UsuarioNaoAutenticadoException("Usuário não autenticado"))
                .when(securityValidator).validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN"));

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(sinistroId, analistaId));
        verifyNoInteractions(repository, mapper, authClient);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoTemPermissao() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        doThrow(new AcessoNegadoException("Acesso negado."))
                .when(securityValidator).validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN"));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(sinistroId, analistaId));
        verifyNoInteractions(repository, mapper, authClient);
    }

    @Test
    void deveLancarExcecao_quandoAnalistaNaoEncontrado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        when(authClient.buscarPorId(analistaId)).thenThrow(feignNotFound());

        assertThrows(AnalistaNaoEncontradoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoAnalistaTemPapelInvalido() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Admin", "admin@email.com", Papel.ADMIN));

        assertThrows(AnalistaInvalidoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }

    @Test
    void deveLancarExcecao_quandoStatusInvalido() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        when(securityValidator.validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"), eq("ADMIN")))
                .thenReturn(criarContexto(UUID.randomUUID().toString(), "GESTOR"));

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.EM_ANALISE);

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));

        assertThrows(StatusInvalidoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }

    private FeignException.NotFound feignNotFound() {
        return (FeignException.NotFound) FeignException.NotFound.errorStatus(
                "AuthClient#buscarPorId(UUID)",
                feign.Response.builder()
                        .status(404)
                        .reason("Not Found")
                        .request(Request.create(Request.HttpMethod.GET,
                                "/api/v1/auth/usuarios",
                                Collections.emptyMap(),
                                new byte[0],
                                Charset.defaultCharset()))
                        .build()
        );
    }
}
