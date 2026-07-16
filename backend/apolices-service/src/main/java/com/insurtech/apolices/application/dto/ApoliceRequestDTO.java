package com.insurtech.apolices.application.dto;

import com.insurtech.apolices.domain.model.TipoSeguro;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ApoliceRequestDTO(

        @NotNull(message = "ID do segurado é obrigatório")
        UUID seguradoId,

        @NotBlank(message = "Número da apólice é obrigatório")
        String numeroApolice,

        @NotNull(message = "Tipo de seguro é obrigatório")
        TipoSeguro tipoSeguro,

        @NotNull(message = "Valor do seguro é obrigatório")
        @Positive(message = "Valor do seguro deve ser positivo")
        @Digits(integer = 14, fraction = 2, message = "Valor inválido")
        BigDecimal valorSeguro,

        @NotNull(message = "Valor do prêmio é obrigatório")
        @Positive(message = "Valor do prêmio deve ser positivo")
        @Digits(integer = 14, fraction = 2, message = "Valor inválido")
        BigDecimal valorPremio,

        @NotNull(message = "Data de início da vigência é obrigatória")
        @FutureOrPresent(message = "Data de início da vigência deve ser futura ou presente")
        LocalDate dataInicioVigencia,

        @NotNull(message = "Data de fim da vigência é obrigatória")
        @FutureOrPresent(message = "Data de fim da vigência deve ser futura ou presente")
        LocalDate dataFimVigencia,

        @Valid
        List<CoberturaRequestDTO> coberturas
) {
}
