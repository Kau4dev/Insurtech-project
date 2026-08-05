package com.insurtech.segurados.application.usecase;


import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.CpfCnpjJaCadastradoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
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

        Segurado segurado = mapper.toDomain(dto);
        segurado.setId(UUID.randomUUID());
        segurado.setCreatedAt(Instant.now());

        segurado.validar();

        Segurado salvo = repository.salvar(segurado);

        return mapper.toResponse(salvo);

    }

}
