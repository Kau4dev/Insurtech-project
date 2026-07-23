package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.PageResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListarSinistrosUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final SeguradoClient seguradoClient;
    private final ApoliceClient apoliceClient;

    public PageResponseDTO<SinistroResponseDTO> executar(
            UUID apoliceId,
            UUID seguradoId,
            UUID analistaId,
            Status status,
            TipoSinistro tipoSinistro,
            LocalDate dataInicio,
            LocalDate dataFim,
            Pageable pageable
    ) {

        if (seguradoId != null) {
            try {
                seguradoClient.buscarPorId(seguradoId);
            } catch (FeignException.NotFound e) {
                throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + seguradoId);
            }
        }

        if (apoliceId != null) {
            try {
                apoliceClient.buscarPorId(apoliceId);
            } catch (FeignException.NotFound e) {
                throw new ApoliceNaoEncontradaException("Apólice não encontrada: " + apoliceId);
            }
        }

        Page<SinistroResponseDTO> page = repository.listar(
                        apoliceId,
                        seguradoId,
                        analistaId,
                        status,
                        tipoSinistro,
                        dataInicio,
                        dataFim,
                        pageable)
                .map(mapper::toResponse);
        return PageResponseDTO.from(page);


    }


}
