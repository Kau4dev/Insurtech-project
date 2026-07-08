package com.insurtech.segurados.application.usecase;


import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuscarPorIdSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public SeguradoResponseDTO buscarPorId(UUID id) {
        return repository.buscarPorId(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new SeguradoNaoEncontradoException("Segurado não encontrado com o ID: " + id));
    }
}
