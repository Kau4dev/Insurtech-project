package com.insurtech.sinistros.application.dto.request;

import com.insurtech.sinistros.domain.model.Status;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record IniciarAnaliseRequestDTO(

        @NotNull(message = "ID da apólice é obrigatório")
        UUID analistaId
) {
}
