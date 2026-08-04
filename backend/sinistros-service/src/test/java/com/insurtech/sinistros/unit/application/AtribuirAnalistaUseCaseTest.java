package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.AtribuirAnalistaUseCase;
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
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.AfterEach;
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

    @InjectMocks
    private AtribuirAnalistaUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    // ── Sucesso: GESTOR atribui qualquer analista ──────────────────────────────

    @Test
    void deveAtribuirAnalista_comoGestor_comSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

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
        setUserContext(UUID.randomUUID().toString(), "ADMIN");

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO);

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(sinistroId, analistaId));
    }

    // ── Sucesso: ANALISTA se auto-atribui ─────────────────────────────────────

    @Test
    void deveAtribuirAnalista_comoAnalista_autoAtribuicao_comSucesso() {
        UUID analistaId = UUID.randomUUID(); // usuário logado = analista a ser atribuído
        UUID sinistroId = UUID.randomUUID();
        setUserContext(analistaId.toString(), "ANALISTA");

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO);

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(sinistroId, analistaId));
    }

    // ── Falha: ANALISTA tenta atribuir a outro ────────────────────────────────

    @Test
    void deveLancarExcecao_quandoAnalistaTentaAtribuirAOutroAnalista() {
        UUID analistaLogadoId = UUID.randomUUID();
        UUID outroAnalistaId = UUID.randomUUID(); // diferente do logado
        UUID sinistroId = UUID.randomUUID();
        setUserContext(analistaLogadoId.toString(), "ANALISTA");

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(sinistroId, outroAnalistaId));
        verifyNoInteractions(authClient, repository, mapper);
    }

    // ── Falha: sem autenticação ────────────────────────────────────────────────

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        // Contexto vazio — usuarioId null

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(sinistroId, analistaId));
        verifyNoInteractions(repository, mapper, authClient);
    }

    // ── Falha: papel inválido (ex: SEGURADO) ──────────────────────────────────

    @Test
    void deveLancarExcecao_quandoUsuarioNaoTemPermissao() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(sinistroId, analistaId));
        verifyNoInteractions(repository, mapper, authClient);
    }

    // ── Falha: analista não encontrado no auth-service ────────────────────────

    @Test
    void deveLancarExcecao_quandoAnalistaNaoEncontrado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        when(authClient.buscarPorId(analistaId)).thenThrow(feignNotFound());

        assertThrows(AnalistaNaoEncontradoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verifyNoInteractions(repository, mapper);
    }

    // ── Falha: analista tem papel inválido (ex: ADMIN) ─────────────────────────

    @Test
    void deveLancarExcecao_quandoAnalistaTemPapelInvalido() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Admin", "admin@email.com", Papel.ADMIN));

        assertThrows(AnalistaInvalidoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verifyNoInteractions(repository, mapper);
    }

    // ── Falha: sinistro não encontrado ────────────────────────────────────────

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        when(authClient.buscarPorId(analistaId)).thenReturn(new UsuarioResponseDTO(analistaId, "Analista", "analista@email.com", Papel.ANALISTA));
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(sinistroId, analistaId));
        verify(authClient, times(1)).buscarPorId(analistaId);
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }

    // ── Falha: status inválido ─────────────────────────────────────────────────

    @Test
    void deveLancarExcecao_quandoStatusInvalido() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.EM_ANALISE); // Já em análise → inválido

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
