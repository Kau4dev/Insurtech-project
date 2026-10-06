package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.exception.ApoliceInvalidaException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.DataOcorrenciaInvalidaException;
import com.insurtech.sinistros.domain.exception.SinistrojaCadastradaException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Transactional
@Service
@RequiredArgsConstructor
public class CadastrarSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final ApoliceClient apoliceClient;
    private final EventPublisherPort eventPublisher;
    private final SinistroSecurityValidator securityValidator;

    public SinistroResponseDTO executar(SinistroRequestDTO dto) {
        securityValidator.validarPapeis("ANALISTA", "GESTOR", "ADMIN", "SEGURADO");

        securityValidator.buscarEValidarPropriedadeSegurado(
                dto.seguradoId(),
                "Acesso negado. Você só pode registrar sinistros para o seu próprio cadastro."
        );

        ApoliceResponseDTO apolice;
        try {
            apolice = apoliceClient.buscarPorId(dto.apoliceId());
        } catch (FeignException.NotFound e) {
            throw new ApoliceNaoEncontradaException("Apólice não encontrada: " + dto.apoliceId());
        }

        if (apolice == null) {
            throw new ApoliceNaoEncontradaException("Apólice não encontrada: " + dto.apoliceId());
        }

        if (apolice.seguradoId() != null && !apolice.seguradoId().equals(dto.seguradoId())) {
            throw new ApoliceInvalidaException("A apólice informada não pertence ao segurado informado");
        }

        if (apolice.status() != null && apolice.status() != com.insurtech.sinistros.infrastructure.client.dto.Status.ATIVA) {
            throw new ApoliceInvalidaException("Só é possível registrar sinistro para apólice ATIVA (status atual: " + apolice.status() + ")");
        }

        if (dto.dataOcorrencia() != null) {
            if (dto.dataOcorrencia().isAfter(LocalDate.now())) {
                throw new DataOcorrenciaInvalidaException("Data do ocorrido não pode ser futura");
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            if (apolice.dataInicioVigencia() != null && dto.dataOcorrencia().isBefore(apolice.dataInicioVigencia())) {
                throw new DataOcorrenciaInvalidaException(
                        "Data do ocorrido anterior ao início da vigência da apólice (" + apolice.dataInicioVigencia().format(formatter) + ")"
                );
            }
            if (apolice.dataFimVigencia() != null && dto.dataOcorrencia().isAfter(apolice.dataFimVigencia())) {
                throw new DataOcorrenciaInvalidaException(
                        "Data do ocorrido posterior ao término da vigência da apólice (" + apolice.dataFimVigencia().format(formatter) + ")"
                );
            }
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
