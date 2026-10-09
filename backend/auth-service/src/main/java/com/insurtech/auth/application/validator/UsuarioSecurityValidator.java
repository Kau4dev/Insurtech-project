package com.insurtech.auth.application.validator;

import com.insurtech.auth.domain.exception.AcessoNegadoException;
import com.insurtech.auth.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.auth.infrastructure.security.UserContext;
import com.insurtech.auth.infrastructure.security.UserContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class UsuarioSecurityValidator {

    public UserContext validarAutenticacao() {
        UserContext ctx = UserContextHolder.getContext();
        if (ctx == null || ctx.getUsuarioId() == null || ctx.getUsuarioId().isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado.");
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
}
