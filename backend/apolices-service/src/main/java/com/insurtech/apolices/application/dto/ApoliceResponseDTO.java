package com.insurtech.apolices.application.dto;

import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ApoliceResponseDTO(
        UUID id,
        UUID seguradoId,
        String numeroApolice,
        TipoSeguro tipoSeguro,
        BigDecimal valorSeguro,
        BigDecimal valorPremio,
        LocalDate dataInicioVigencia,
        LocalDate dataFimVigencia,
        Status status,
        List<CoberturaResponseDTO> coberturas,
        java.time.Instant createdAt
) {
}
