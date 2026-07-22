package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.RejeitarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RejeitarSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final EventPublisherPort eventPublisher;

    public SinistroResponseDTO executar(UUID id, RejeitarSinistroRequestDTO dto) {
        var sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Sinistro não encontrado com o ID: " + id));

        sinistro.rejeitar(dto.motivoRejeicao());
        Sinistro savedSinistro = repository.salvar(sinistro);

        eventPublisher.publicarSinistroRejeitado(new SinistroRejeitadoEvent(
                        savedSinistro.getId(),
                        savedSinistro.getSeguradoId(),
                        savedSinistro.getMotivoRejeicao()
        ));
        return mapper.toResponse(savedSinistro);
    }
}
