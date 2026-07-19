package com.insurtech.apolices.application.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CoberturaRequestDTO(

        @NotBlank(message = "Tipo de cobertura é obrigatório")
        String tipoCobertura,

        @NotNull(message = "Valor da cobertura é obrigatório")
        @Positive(message = "Valor da cobertura deve ser positivo")
        @Digits(integer = 14, fraction = 2, message = "Valor inválido")
        BigDecimal valorCobertura,

        @PositiveOrZero(message = "Valor da franquia deve ser positivo ou zero")
        BigDecimal valorFranquia
) {
}
