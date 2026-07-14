package com.insurtech.apolices.application.dto;

import com.insurtech.apolices.domain.model.TipoSeguro;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ApoliceRequestDTO(

        @NotNull
        UUID seguradoId,

        @NotBlank(message = "Número da apólice é obrigatório")
        String numeroApolice,

        @NotNull
        TipoSeguro tipoSeguro,

        @NotNull
        @Positive
        BigDecimal valorSeguro,

        @NotNull
        @Positive
        BigDecimal valorPremio,

        @NotNull
        @FutureOrPresent
        LocalDate dataInicioVigencia,

        @NotNull
        @FutureOrPresent
        LocalDate dataFimVigencia,

        @Valid
        List<CoberturaRequestDTO> coberturas
) {
}
