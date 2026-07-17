package com.insurtech.sinistros.application.dto.response;

import com.insurtech.sinistros.domain.model.Status;

import java.time.Instant;

public record HistoricoSinistroResponseDTO(
        Status statusAnterior,
        Status statusNovo,
        String observacao,
        Instant createdAt
) {
}
