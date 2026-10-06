package com.insurtech.sinistros.application.validator;

import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.client.dto.SeguradoResponseDTO;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SinistroSecurityValidator {

    private final SeguradoClient seguradoClient;

    public UserContext validarAutenticacao() {
        UserContext ctx = UserContextHolder.getContext();
        if (ctx == null || ctx.getUsuarioId() == null || ctx.getUsuarioId().isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }
        return ctx;
    }

    public UserContext validarPapeis(String... papeisPermitidos) {
        return validarPapeisComMensagem("Acesso negado. Você não possui permissão para realizar esta operação.", papeisPermitidos);
    }

    public UserContext validarPapeisComMensagem(String mensagemErro, String... papeisPermitidos) {
        UserContext ctx = validarAutenticacao();
        String papel = ctx.getUsuarioPapel();

        boolean permitido = papel != null && Arrays.asList(papeisPermitidos).contains(papel);
        if (!permitido) {
            throw new AcessoNegadoException(mensagemErro);
        }
        return ctx;
    }

    public SeguradoResponseDTO validarPropriedadeSegurado(UUID seguradoId, String mensagemAcessoNegado) {
        UserContext ctx = validarAutenticacao();

        if ("SEGURADO".equals(ctx.getUsuarioPapel())) {
            if (seguradoId == null) {
                throw new AcessoNegadoException("Identificador do segurado é obrigatório para consultar seus sinistros.");
            }

            SeguradoResponseDTO segurado = buscarSegurado(seguradoId);
            if (segurado == null || segurado.usuarioId() == null
                    || !ctx.getUsuarioId().equals(segurado.usuarioId().toString())) {
                throw new AcessoNegadoException(mensagemAcessoNegado);
            }
            return segurado;
        }

        return null;
    }

    public SeguradoResponseDTO buscarEValidarPropriedadeSegurado(UUID seguradoId, String mensagemAcessoNegado) {
        UserContext ctx = validarAutenticacao();
        SeguradoResponseDTO segurado = buscarSegurado(seguradoId);

        if ("SEGURADO".equals(ctx.getUsuarioPapel())) {
            if (segurado.usuarioId() == null || !ctx.getUsuarioId().equals(segurado.usuarioId().toString())) {
                throw new AcessoNegadoException(mensagemAcessoNegado);
            }
        }
        return segurado;
    }

    public SeguradoResponseDTO validarExistenciaSegurado(UUID seguradoId) {
        return buscarSegurado(seguradoId);
    }

    private SeguradoResponseDTO buscarSegurado(UUID seguradoId) {
        if (seguradoId == null) {
            throw new SeguradoNaoEncontradoException("Segurado não encontrado: null");
        }
        try {
            SeguradoResponseDTO segurado = seguradoClient.buscarPorId(seguradoId);
            if (segurado == null) {
                throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + seguradoId);
            }
            return segurado;
        } catch (FeignException.NotFound e) {
            throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + seguradoId);
        }
    }
}
