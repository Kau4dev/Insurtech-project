package com.insurtech.sinistros.application.dto.request;

import com.insurtech.sinistros.domain.model.TipoSinistro;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SinistroRequestDTO(

        @NotBlank(message = "Número do sinistro é obrigatório")
        String numeroSinistro,

        @NotNull(message = "ID da apólice é obrigatório")
        UUID apoliceId,

        @NotNull(message = "ID do segurado é obrigatório")
        UUID seguradoId,

        @NotBlank(message = "Tipo do sinistro é obrigatório")
        TipoSinistro tipoSinistro,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
        String descricao,

        @NotNull(message = "Data de ocorrência é obrigatória")
        @PastOrPresent(message = "Data de ocorrência não pode ser futura")
        LocalDate dataOcorrencia,

        @NotNull(message = "Valor estimado é obrigatório")
        @DecimalMin(value = "0.01", message = "Valor estimado deve ser maior que zero")
        @Digits(integer = 12, fraction = 2, message = "Valor inválido")
        BigDecimal valorEstimado
) {}
