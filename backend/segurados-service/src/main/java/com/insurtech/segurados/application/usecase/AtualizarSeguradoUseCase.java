package com.insurtech.segurados.application.usecase;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Transactional
@Service
@RequiredArgsConstructor
public class AtualizarSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public SeguradoResponseDTO executar(UUID id, SeguradoUpdateDTO dto) {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas gestores ou administradores podem atualizar informações de segurados.");
        }

        Segurado segurado = repository.buscarPorId(id)
                .orElseThrow(() -> new SeguradoNaoEncontradoException("Segurado não encontrado com o ID: " + id));

        segurado.atualizar(dto);
        segurado.validar();

        return mapper.toResponse(repository.salvar(segurado));
    }
}
