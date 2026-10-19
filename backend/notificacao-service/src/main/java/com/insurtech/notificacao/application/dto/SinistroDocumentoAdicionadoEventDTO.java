package com.insurtech.notificacao.application.dto;

import java.time.Instant;
import java.util.UUID;

public record SinistroDocumentoAdicionadoEventDTO(
        UUID sinistroId,
        UUID seguradoId,
        String numeroSinistro,
        String nomeArquivo,
        String tipoDocumento,
        Instant dataUpload) {
}
