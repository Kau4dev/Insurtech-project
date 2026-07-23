package com.insurtech.sinistros.infrastructure.client.dto;

import java.math.BigDecimal;
import java.time.Instant;
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
    Instant createdAt,
    Instant updatedAt
) {
}
