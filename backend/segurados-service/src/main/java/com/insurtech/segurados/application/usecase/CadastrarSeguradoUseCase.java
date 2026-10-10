package com.insurtech.segurados.application.usecase;


import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.exception.*;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.client.AuthClient;
import com.insurtech.segurados.infrastructure.client.dto.CadastrarUsuarioRequestDTO;
import com.insurtech.segurados.infrastructure.client.dto.Papel;
import com.insurtech.segurados.infrastructure.client.dto.UsuarioCriadoResponseDTO;
import com.insurtech.segurados.infrastructure.client.dto.UsuarioResponseDTO;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Transactional
@Service
@RequiredArgsConstructor
public class CadastrarSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;
    private final AuthClient client;

    public SeguradoResponseDTO executar(SeguradoRequestDTO dto) {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas gestores ou administradores podem cadastrar segurados.");
        }

        repository.buscarPorCpfCnpj(dto.cpfCnpj())
                .ifPresent(s -> { throw new CpfCnpjJaCadastradoException("CPF/CNPJ já cadastrado: " + dto.cpfCnpj()); });

        UUID usuarioIdFinal = dto.usuarioId();
        String senhaTemporaria = null;


        if (usuarioIdFinal == null) {

            UsuarioCriadoResponseDTO novoUsuario = client.cadastrarUsuario(new CadastrarUsuarioRequestDTO(
                    dto.nomeRazaoSocial(),
                    dto.email(),
                    null,
                    Papel.SEGURADO
            ));
            usuarioIdFinal = novoUsuario.id();
            senhaTemporaria = novoUsuario.senhaTemporaria();
        } else {

            UsuarioResponseDTO usuario;
            try {
                usuario = client.buscarPorId(usuarioIdFinal);
            } catch (FeignException.NotFound e) {
                throw new UsuarioNaoEncontradoException("Usuário não encontrado: " + usuarioIdFinal);
            }
            if (!Boolean.TRUE.equals(usuario.ativo())) {
                throw new UsuarioInvalidoParaSeguradoException("Usuário não está ativo: " + usuarioIdFinal);
            }
            if (!Papel.SEGURADO.equals(usuario.papel())) {
                throw new UsuarioInvalidoParaSeguradoException("Usuário não possui papel de segurado: " + usuarioIdFinal);
            }
        }
        repository.buscarPorUsuarioId(usuarioIdFinal)
                .ifPresent(s -> { throw new UsuarioJaCadastradoException("Usuário já possui um segurado cadastrado."); });

        Segurado segurado = mapper.toDomain(dto);
        segurado.setId(UUID.randomUUID());
        segurado.setUsuarioId(usuarioIdFinal);
        segurado.setCreatedAt(Instant.now());
        segurado.validar();
        Segurado salvo = repository.salvar(segurado);

        return mapper.toResponse(salvo, senhaTemporaria);
    }
}