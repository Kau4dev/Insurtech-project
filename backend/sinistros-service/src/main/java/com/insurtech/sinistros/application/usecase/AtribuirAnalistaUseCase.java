package com.insurtech.sinistros.application.usecase;


import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AtribuirAnalistaUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;

    public SinistroResponseDTO executar(UUID sinistroId, UUID analistaId) {
        Sinistro sinistro = repository.buscarPorId(sinistroId)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + sinistroId));

        sinistro.iniciarAnalise(analistaId);

        return mapper.toResponse(repository.salvar(sinistro));
    }
}
