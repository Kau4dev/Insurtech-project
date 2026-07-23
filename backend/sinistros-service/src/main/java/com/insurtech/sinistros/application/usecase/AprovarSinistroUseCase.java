package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.AprovarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroAprovadoEvent;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AprovarSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final ApoliceClient client;
    private final EventPublisherPort eventPublisher;

    public SinistroResponseDTO executar(UUID id, AprovarSinistroRequestDTO dto) {

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        ApoliceResponseDTO apolice;
        try {
            apolice = client.buscarPorId(sinistro.getApoliceId());
        } catch (FeignException e) {
            throw new ApoliceNaoEncontradaException("Apólice não encontrada com o ID: " + sinistro.getApoliceId());
        }

        sinistro.aprovar(dto.valorAprovado(), apolice.valorPremio());
        Sinistro savedSinistro = repository.salvar(sinistro);

        eventPublisher.publicarSinistroAprovado(new SinistroAprovadoEvent(
                savedSinistro.getId(),
                savedSinistro.getSeguradoId(),
                savedSinistro.getValorAprovado()
        ));

        return mapper.toResponse(savedSinistro);
    }

}
