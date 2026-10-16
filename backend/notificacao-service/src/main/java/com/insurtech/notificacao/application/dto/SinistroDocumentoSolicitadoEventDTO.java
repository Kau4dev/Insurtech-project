package com.insurtech.notificacao.application.dto;

import java.time.Instant;
import java.util.UUID;

public record SinistroDocumentoSolicitadoEventDTO(
        UUID sinistroId,
        UUID seguradoId,
        String numeroSinistro,
        Instant dataSolicitacao
) {
}
