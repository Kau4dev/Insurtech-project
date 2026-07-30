package com.insurtech.auth.application.usecase;

import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.domain.exception.TokenInvalidoException;
import com.insurtech.auth.domain.exception.UsuarioNaoEncontradoException;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import com.insurtech.auth.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuscarUsuarioUseCase {

    private final UsuarioRepository repository;
    private final JwtService jwtService;
    private final UsuarioMapper mapper;

    public UsuarioResponseDTO executarPorToken(String token) {
        if (!jwtService.isTokenValido(token)) {
            throw new TokenInvalidoException("Token inválido ou expirado");
        }
        UUID usuarioId = jwtService.extrairUsuarioId(token);
        Usuario usuario = repository.buscarPorId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrada com o ID: " + usuarioId));
        return mapper.toResponse(usuario);
    }
}