package com.insurtech.apolices.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CoberturaRequestDTO(
        @NotBlank
        String tipoCobertura,

        @NotNull
        @Positive
        BigDecimal valorCobertura,

        @PositiveOrZero
        BigDecimal valorFranquia
) {
}
