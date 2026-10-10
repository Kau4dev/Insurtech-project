package com.insurtech.auth.application.usecase;

import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.UsuarioNaoEncontradoException;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AtualizarUsuarioUseCase {

    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;
    private final UsuarioSecurityValidator securityValidator;

    public UsuarioResponseDTO executar(UUID usuarioId) {
        securityValidator.validarPapeisComMensagem("Apenas administradores e gestores podem ativar usuários.", "ADMIN", "GESTOR");

        Usuario usuario = repository.buscarPorId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado com o ID: " + usuarioId));

        if (Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new IllegalStateException("Usuário já está ativo: " + usuarioId);
        }

        usuario.setAtivo(true);
        usuario.setUpdatedAt(java.time.Instant.now());
        Usuario salvo = repository.salvar(usuario);
        return mapper.toResponse(salvo);
    }
}
