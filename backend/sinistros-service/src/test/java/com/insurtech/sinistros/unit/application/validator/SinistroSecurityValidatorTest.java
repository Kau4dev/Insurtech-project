package com.insurtech.sinistros.unit.application.validator;

import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.client.dto.SeguradoResponseDTO;
import com.insurtech.sinistros.infrastructure.client.dto.TipoPessoa;
import com.insurtech.sinistros.infrastructure.client.dto.Uf;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SinistroSecurityValidatorTest {

    @Mock
    private SeguradoClient seguradoClient;

    @InjectMocks
    private SinistroSecurityValidator validator;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    private SeguradoResponseDTO criarSeguradoDTO(UUID seguradoId, UUID usuarioId) {
        return new SeguradoResponseDTO(
                seguradoId, usuarioId, TipoPessoa.PF, "Nome", "12345678901",
                "email@email.com", "11911112222", LocalDate.of(1990, 1, 1),
                "Rua", "Cidade", Uf.SP, "01001000", Instant.now()
        );
    }

    @Test
    void deveValidarAutenticacao_comSucesso() {
        setUserContext("user-1", "ANALISTA");

        UserContext ctx = validator.validarAutenticacao();

        assertNotNull(ctx);
        assertEquals("user-1", ctx.getUsuarioId());
        assertEquals("ANALISTA", ctx.getUsuarioPapel());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        assertThrows(UsuarioNaoAutenticadoException.class, () -> validator.validarAutenticacao());
    }

    @Test
    void deveValidarPapeis_comSucesso() {
        setUserContext("user-1", "GESTOR");

        UserContext ctx = validator.validarPapeis("ANALISTA", "GESTOR");

        assertNotNull(ctx);
        assertEquals("GESTOR", ctx.getUsuarioPapel());
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        setUserContext("user-1", "SEGURADO");

        AcessoNegadoException ex = assertThrows(AcessoNegadoException.class,
                () -> validator.validarPapeisComMensagem("Erro customizado", "ANALISTA", "GESTOR"));
        assertEquals("Erro customizado", ex.getMessage());
    }

    @Test
    void deveValidarPropriedadeSegurado_quandoNaoForSegurado_retornaNullSemChamarClient() {
        setUserContext("user-1", "ANALISTA");
        UUID seguradoId = UUID.randomUUID();

        SeguradoResponseDTO resultado = validator.validarPropriedadeSegurado(seguradoId, "Erro");

        assertNull(resultado);
        verifyNoInteractions(seguradoClient);
    }

    @Test
    void deveValidarPropriedadeSegurado_quandoSeguradoDono_retornaSegurado() {
        UUID usuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "SEGURADO");

        SeguradoResponseDTO segurado = criarSeguradoDTO(seguradoId, usuarioId);
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(segurado);

        SeguradoResponseDTO resultado = validator.validarPropriedadeSegurado(seguradoId, "Erro");

        assertNotNull(resultado);
        assertEquals(seguradoId, resultado.id());
        verify(seguradoClient, times(1)).buscarPorId(seguradoId);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoTentaAcessarRegistroDeOutro() {
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "SEGURADO");

        SeguradoResponseDTO outroSegurado = criarSeguradoDTO(seguradoId, outroUsuarioId);
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(outroSegurado);

        AcessoNegadoException ex = assertThrows(AcessoNegadoException.class,
                () -> validator.validarPropriedadeSegurado(seguradoId, "Acesso negado a dados de terceiros."));
        assertEquals("Acesso negado a dados de terceiros.", ex.getMessage());
    }

    @Test
    void deveLancarExcecao_quandoSeguradoIdNuloAoValidarPropriedadeSegurado() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        assertThrows(AcessoNegadoException.class,
                () -> validator.validarPropriedadeSegurado(null, "Erro"));
        verifyNoInteractions(seguradoClient);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontradoNoClient() {
        UUID usuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "SEGURADO");

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, StandardCharsets.UTF_8, new RequestTemplate());
        when(seguradoClient.buscarPorId(seguradoId)).thenThrow(new FeignException.NotFound("Not Found", request, null, null));

        assertThrows(SeguradoNaoEncontradoException.class,
                () -> validator.validarPropriedadeSegurado(seguradoId, "Erro"));
    }

    @Test
    void deveBuscarEValidarPropriedadeSegurado_quandoAnalista_retornaSegurado() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        UUID seguradoId = UUID.randomUUID();

        SeguradoResponseDTO segurado = criarSeguradoDTO(seguradoId, UUID.randomUUID());
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(segurado);

        SeguradoResponseDTO resultado = validator.buscarEValidarPropriedadeSegurado(seguradoId, "Erro");

        assertNotNull(resultado);
        assertEquals(seguradoId, resultado.id());
    }

    @Test
    void deveValidarExistenciaSegurado_comSucesso() {
        UUID seguradoId = UUID.randomUUID();
        SeguradoResponseDTO segurado = criarSeguradoDTO(seguradoId, UUID.randomUUID());
        when(seguradoClient.buscarPorId(seguradoId)).thenReturn(segurado);

        SeguradoResponseDTO resultado = validator.validarExistenciaSegurado(seguradoId);

        assertNotNull(resultado);
        assertEquals(seguradoId, resultado.id());
    }
}
