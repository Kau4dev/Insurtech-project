package com.insurtech.apolices.application.dto;

import com.insurtech.apolices.domain.model.TipoSeguro;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ApoliceUpdateDTO(
        TipoSeguro tipoSeguro,

        @Positive
        BigDecimal valorSeguro,

        @Positive
        BigDecimal valorPremio,

        @FutureOrPresent
        LocalDate dataInicioVigencia,

        @FutureOrPresent
        LocalDate dataFimVigencia
) {
}
