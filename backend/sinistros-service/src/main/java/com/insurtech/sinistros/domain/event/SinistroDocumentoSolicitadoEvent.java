package com.insurtech.sinistros.domain.event;

import java.time.Instant;
import java.util.UUID;

public record SinistroDocumentoSolicitadoEvent(
        UUID sinistroId,
        UUID seguradoId,
        String numeroSinistro,
        Instant dataSolicitacao
) {
}
