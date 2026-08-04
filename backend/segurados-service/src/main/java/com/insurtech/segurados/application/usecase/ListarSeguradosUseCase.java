package com.insurtech.segurados.application.usecase;

import com.insurtech.segurados.application.dto.PageResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class ListarSeguradosUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public PageResponseDTO<SeguradoResponseDTO> executar(String nome, Pageable pageable) {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"ANALISTA".equals(usuarioPapel) && !"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas analistas, gestores ou administradores podem listar segurados.");
        }

        Page<SeguradoResponseDTO> page = repository.listar(nome, pageable)
                .map(mapper::toResponse);
        return PageResponseDTO.from(page);
    }
}
