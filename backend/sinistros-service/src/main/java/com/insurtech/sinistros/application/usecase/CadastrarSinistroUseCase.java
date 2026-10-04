package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceInvalidaException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.DataOcorrenciaInvalidaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistrojaCadastradaException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.SeguradoClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
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
    private final SeguradoClient seguradoClient;
    private final ApoliceClient apoliceClient;
    private final EventPublisherPort eventPublisher;


    public SinistroResponseDTO executar(SinistroRequestDTO dto) {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"ANALISTA".equals(usuarioPapel) && !"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas analistas, gestores ou administradores podem registrar sinistros.");
        }


        try {
            seguradoClient.buscarPorId(dto.seguradoId());
        } catch (FeignException.NotFound e) {
            throw new SeguradoNaoEncontradoException("Segurado não encontrado: " + dto.seguradoId());
        }

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
