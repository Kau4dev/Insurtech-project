package com.insurtech.auth.application.usecase;

import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.AcessoNegadoException;
import com.insurtech.auth.domain.exception.UsuarioNaoEncontradoException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeletarUsuarioUseCase {

    private final UsuarioRepository repository;
    private final UsuarioSecurityValidator securityValidator;

    public void executar(UUID usuarioId) {
        securityValidator.validarPapeisComMensagem("Apenas administradores e gestores podem inativar usuários.", "ADMIN", "GESTOR");

        Usuario usuario = repository.buscarPorId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado com o ID: " + usuarioId));

        if (usuario.getPapel() == Papel.ADMIN) {
            throw new AcessoNegadoException("O usuário ADMIN não pode ser inativado.");
        }

        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            throw new IllegalStateException("Usuário já está inativo: " + usuarioId);
        }

        usuario.setAtivo(false);
        usuario.setUpdatedAt(java.time.Instant.now());
        repository.salvar(usuario);
    }
}
