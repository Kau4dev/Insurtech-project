package com.insurtech.apolices.application.dto;
import com.insurtech.apolices.domain.model.TipoCobertura;
import java.math.BigDecimal;
import java.util.UUID;

public record CoberturaResponseDTO(
        UUID id,
        TipoCobertura tipoCobertura,
        BigDecimal valorCobertura,
        BigDecimal valorFranquia
) {
}
