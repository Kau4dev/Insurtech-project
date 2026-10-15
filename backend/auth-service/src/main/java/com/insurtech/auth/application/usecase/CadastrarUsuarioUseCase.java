package com.insurtech.auth.application.usecase;

import com.insurtech.auth.application.dto.CadastrarUsuarioRequestDTO;
import com.insurtech.auth.application.dto.UsuarioCriadoResponseDTO;
import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.AcessoNegadoException;
import com.insurtech.auth.domain.exception.EmailJaCadastradoException;
import com.insurtech.auth.domain.exception.SenhaInvalidaException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.domain.service.GeradorSenhaService;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CadastrarUsuarioUseCase {

    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final GeradorSenhaService geradorSenhaService;
    private final UsuarioSecurityValidator securityValidator;

    @Transactional
    public UsuarioCriadoResponseDTO executar(CadastrarUsuarioRequestDTO dto) {
        securityValidator.validarPapeisComMensagem("Apenas administradores e gestores podem cadastrar usuários.", "ADMIN", "GESTOR");

        if (dto.papel() == Papel.ADMIN) {
            throw new AcessoNegadoException("Não é permitido cadastrar usuário com papel ADMIN via sistema.");
        }

        if (repository.buscarPorEmail(dto.email()).isPresent()) {
            throw new EmailJaCadastradoException("Email já cadastrado: " + dto.email());
        }

        String senhaPlana;

        if (dto.papel() == Papel.SEGURADO) {
            senhaPlana = geradorSenhaService.gerarSenhaSegura();
        } else {
            if (dto.senha() == null || dto.senha().length() < 8) {
                throw new SenhaInvalidaException("Senha deve ter no mínimo 8 caracteres.");
            }
            senhaPlana = dto.senha().trim();
        }

        Usuario usuario = mapper.toDomain(dto);
        usuario.setId(UUID.randomUUID());
        usuario.setNome(dto.nome().trim());
        usuario.setEmail(dto.email().trim());
        usuario.setSenhaHash(passwordEncoder.encode(senhaPlana));
        usuario.setPapel(dto.papel());
        usuario.setAtivo(true);
        usuario.setCreatedAt(Instant.now());

        usuario.validar();
        Usuario salvo = repository.salvar(usuario);

        return mapper.toResponse(salvo, senhaPlana);
    }
}
