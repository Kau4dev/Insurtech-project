package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.HistoricoSinistroResponseDTO;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.HistoricoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MostrarHistoricoStatusUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;

    public HistoricoSinistroResponseDTO executar(UUID id) {

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        HistoricoSinistro historicoSinistro = new HistoricoSinistro();
        historicoSinistro.setId(UUID.randomUUID());
        historicoSinistro.setSinistroId(sinistro.getId());

        return mapper.toResponse(historicoSinistro);
    }
}
