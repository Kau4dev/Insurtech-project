package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.event.SinistroDocumentoSolicitadoEvent;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AguardarDocumentosUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final SinistroSecurityValidator securityValidator;
    private final EventPublisherPort eventPublisher;

    public SinistroResponseDTO executar(UUID id) {
        securityValidator.validarPapeis(
                "Acesso negado. Apenas analistas ou gestores podem solicitar documentos.",
                "ANALISTA", "GESTOR"
        );

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        sinistro.aguardarDocumentos();
        Sinistro savedSinistro = repository.salvar(sinistro);

        eventPublisher.publicarDocumentoSolicitado(new SinistroDocumentoSolicitadoEvent(
                savedSinistro.getId(),
                savedSinistro.getSeguradoId(),
                savedSinistro.getNumeroSinistro(),
                Instant.now()
        ));

        return mapper.toResponse(savedSinistro);
    }
}
