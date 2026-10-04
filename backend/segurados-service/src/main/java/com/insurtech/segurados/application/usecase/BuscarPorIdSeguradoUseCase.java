package com.insurtech.segurados.application.usecase;


import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuscarPorIdSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public SeguradoResponseDTO executar(UUID id) {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }
        Segurado segurado = repository.buscarPorId(id)
                .orElseThrow(() -> new SeguradoNaoEncontradoException("Segurado não encontrado com o ID: " + id));

        if ("SEGURADO".equals(usuarioPapel)) {
            if (segurado.getUsuarioId() == null || !usuarioId.equals(segurado.getUsuarioId().toString())) {
                throw new AcessoNegadoException("Acesso negado. Você só pode visualizar suas próprias informações.");
            }
        }
        return mapper.toResponse(segurado);
    }
}
