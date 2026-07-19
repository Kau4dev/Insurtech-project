package com.insurtech.apolices.application.usecase;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuscarPorIdApoliceUseCase {

    private final ApoliceRepository repository;
    private final ApoliceMapper mapper;

    public ApoliceResponseDTO executar(UUID id) {
        return repository.buscarPorId(id)
            .map(mapper::toResponse)
                .orElseThrow(() -> new ApoliceNaoEncontradaException("Apolice não encontrada com o ID: " + id));
}
}
