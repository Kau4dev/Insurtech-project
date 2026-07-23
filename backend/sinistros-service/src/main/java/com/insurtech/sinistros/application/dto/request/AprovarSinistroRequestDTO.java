package com.insurtech.sinistros.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AprovarSinistroRequestDTO(

        @NotNull(message = "Valor aprovado é obrigatório")
        @DecimalMin(value = "0.01", message = "Valor aprovado deve ser maior que zero")
        @Digits(integer = 14, fraction = 2, message = "Valor inválido")
        BigDecimal valorAprovado
) {
}
