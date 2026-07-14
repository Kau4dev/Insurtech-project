package com.insurtech.apolices.application.usecase;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import com.insurtech.apolices.interfaces.client.SeguradoClient;
import com.insurtech.segurados.application.dto.PageResponseDTO;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListarApolicesUseCase {

    private final ApoliceRepository repository;
    private final ApoliceMapper mapper;
    private final SeguradoClient client;

    public PageResponseDTO<ApoliceResponseDTO> executar(UUID seguradoId, Status status, TipoSeguro tipoSeguro, Pageable pageable) {

        try {
            client.buscarPorId(seguradoId);
        } catch (FeignException.NotFound e) {
            throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + seguradoId);
        }

        Page<ApoliceResponseDTO> page = repository.listar(seguradoId, status, tipoSeguro, pageable)
                .map(mapper::toResponse);
        return PageResponseDTO.from(page);
}
}
