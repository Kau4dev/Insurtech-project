package com.insurtech.sinistros.infrastructure.client.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CoberturaResponseDTO(
        UUID id,
        String tipoCobertura,
        BigDecimal valorCobertura,
        BigDecimal valorFranquia
) {
}
