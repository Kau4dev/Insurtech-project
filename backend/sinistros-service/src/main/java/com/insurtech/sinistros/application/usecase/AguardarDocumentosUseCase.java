package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AguardarDocumentosUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;

    @Transactional
    public SinistroResponseDTO executar(UUID id) {
        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        sinistro.aguardarDocumentos();
        Sinistro savedSinistro = repository.salvar(sinistro);

        return mapper.toResponse(savedSinistro);
    }
}
