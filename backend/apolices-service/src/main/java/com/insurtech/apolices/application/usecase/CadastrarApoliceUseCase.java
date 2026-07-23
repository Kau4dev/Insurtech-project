package com.insurtech.apolices.application.usecase;

import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.apolices.domain.exception.ApolicejaCadastradaException;
import com.insurtech.apolices.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import com.insurtech.apolices.infrastructure.client.SeguradoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import feign.FeignException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CadastrarApoliceUseCase {

    private final ApoliceRepository repository;
    private final ApoliceMapper mapper;
    private final SeguradoClient client;

    public ApoliceResponseDTO executar(ApoliceRequestDTO dto) {

        try {
            client.buscarPorId(dto.seguradoId());
        } catch (FeignException.NotFound e) {
            throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + dto.seguradoId());
        }

        repository.buscarPorNumero(dto.numeroApolice())
                .ifPresent(a -> { throw new ApolicejaCadastradaException("Apolice já cadastrada: " + dto.numeroApolice()); });

        Apolice apolice = mapper.toDomain(dto);
        apolice.setId(UUID.randomUUID());
        apolice.setCreatedAt(Instant.now());
        apolice.setStatus(Status.ATIVA);

        if (apolice.getCoberturas() != null) {
            apolice.getCoberturas().forEach(c -> {
                c.setId(UUID.randomUUID());
                c.setApoliceId(apolice.getId());
            });
        }

        repository.salvar(apolice);
        return mapper.toResponse(apolice);
    }
}
