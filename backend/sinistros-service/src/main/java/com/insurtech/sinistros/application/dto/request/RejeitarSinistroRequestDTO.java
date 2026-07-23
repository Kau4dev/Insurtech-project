package com.insurtech.sinistros.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejeitarSinistroRequestDTO(

        @NotBlank(message = "Motivo de rejeição é obrigatório")
        @Size(max = 500, message = "Motivo deve ter no máximo 500 caracteres")
        String motivoRejeicao
) {
}
