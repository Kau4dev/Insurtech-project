package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.PageResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
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
    private final ApoliceClient apoliceClient;
    private final SinistroSecurityValidator securityValidator;

    public PageResponseDTO<SinistroResponseDTO> executar(
            String numeroSinistro,
            UUID apoliceId,
            UUID seguradoId,
            UUID analistaId,
            Status status,
            TipoSinistro tipoSinistro,
            LocalDate dataInicio,
            LocalDate dataFim,
            Pageable pageable
    ) {
        UserContext ctx = securityValidator.validarPapeis(
                "Acesso negado. Você não possui permissão para listar sinistros.",
                "ANALISTA", "GESTOR", "ADMIN", "SEGURADO"
        );

        if ("ANALISTA".equals(ctx.getUsuarioPapel())) {
            analistaId = UUID.fromString(ctx.getUsuarioId());
        }

        if ("SEGURADO".equals(ctx.getUsuarioPapel())) {
            securityValidator.validarPropriedadeSegurado(
                    seguradoId,
                    "Acesso negado. Você só pode visualizar seus próprios sinistros."
            );
        } else if (seguradoId != null) {
            securityValidator.validarExistenciaSegurado(seguradoId);
        }

        if (apoliceId != null) {
            try {
                apoliceClient.buscarPorId(apoliceId);
            } catch (FeignException.NotFound e) {
                throw new ApoliceNaoEncontradaException("Apólice não encontrada: " + apoliceId);
            }
        }

        Page<SinistroResponseDTO> page = repository.listar(
                        numeroSinistro,
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