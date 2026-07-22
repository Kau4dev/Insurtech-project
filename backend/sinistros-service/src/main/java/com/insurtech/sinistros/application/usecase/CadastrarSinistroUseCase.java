package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistrojaCadastradaException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CadastrarSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final SeguradoClient seguradoClient;
    private final ApoliceClient apoliceClient;
    private final EventPublisherPort eventPublisher;


    public SinistroResponseDTO executar(SinistroRequestDTO dto) {

        try {
            seguradoClient.buscarPorId(dto.seguradoId());
        } catch (FeignException.NotFound e) {
            throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + dto.seguradoId());
        }

        try {
            apoliceClient.buscarPorId(dto.apoliceId());
        } catch (FeignException.NotFound e) {
            throw new ApoliceNaoEncontradaException("Apólice não encontrada: " + dto.apoliceId());
        }

        repository.buscarPorNumero(dto.numeroSinistro())
                .ifPresent(a -> { throw new SinistrojaCadastradaException("Sinistro já cadastrado: " + dto.numeroSinistro()); });


        Sinistro sinistro = mapper.toDomain(dto);
        sinistro.setId(UUID.randomUUID());
        sinistro.setStatus(Status.REGISTRADO);
        repository.salvar(sinistro);

        eventPublisher.publicarSinistroRegistrado(new SinistroRegistradoEvent(
                sinistro.getId(),
                sinistro.getSeguradoId(),
                sinistro.getNumeroSinistro()
        ));

        return mapper.toResponse(sinistro);
    }

}
