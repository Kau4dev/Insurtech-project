package com.insurtech.segurados.application.usecase;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AtualizarSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public SeguradoResponseDTO executar(UUID id, SeguradoUpdateDTO dto) {
        Segurado segurado = repository.buscarPorId(id)
                .orElseThrow(() -> new SeguradoNaoEncontradoException("Segurado não encontrado com o ID: " + id));

        segurado.atualizar(dto);
        segurado.validar();

        return mapper.toResponse(repository.salvar(segurado));
    }
}
