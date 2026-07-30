package com.insurtech.auth.application.usecase;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.LoginResponseDTO;
import com.insurtech.auth.domain.exception.EmailNaoEncontradoException;
import com.insurtech.auth.domain.exception.SenhaIncorretaException;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UsuarioRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO executar(LoginRequestDTO dto) {


        Usuario usuario = repository.buscarPorEmail(dto.email())
                .orElseThrow(() -> new EmailNaoEncontradoException("Email não encontrado"));

        usuario.validar();

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenhaHash())) {
            throw new SenhaIncorretaException("Senha incorreta");
        }
        String token = jwtService.gerarToken(usuario);

        return new LoginResponseDTO(
                token,
                "Bearer",
                3600L,   // 1 hora em segundos
                usuario.getPapel().name()
        );
    }
}