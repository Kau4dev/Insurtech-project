package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.SinistroDetalhadoResponseDTO;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuscarPorIdSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;

    public SinistroDetalhadoResponseDTO executar(UUID id) {
        return repository.buscarPorId(id)
                .map(mapper::toDetalhadoResponse)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));
    }
}
