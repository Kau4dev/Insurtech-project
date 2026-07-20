package com.insurtech.sinistros.domain.repository;

import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface SinistroRepository {

    Sinistro salvar(Sinistro sinistro);

    Optional<Sinistro> buscarPorId(UUID id);

    Optional<Sinistro> buscarPorNumero(String numeroSinistro);

    Page<Sinistro> listar(
            UUID apoliceId,
            UUID seguradoId,
            UUID analistaId,
            Status status,
            TipoSinistro tipoSinistro,
            LocalDate dataInicio,
            LocalDate dataFim,
            Pageable pageable
    );

    Map<Status, Long> contarPorStatus();

    BigDecimal somarValorEstimadoPorStatus(Status status);

    BigDecimal somarValorAprovadoPorStatus(List<Status> statuses);

}
