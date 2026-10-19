package com.insurtech.sinistros.domain.event;

import com.insurtech.sinistros.domain.model.TipoDocumento;

import java.time.Instant;
import java.util.UUID;

public record SinistroDocumentoAdicionadoEvent(
        UUID sinistroId,
        UUID seguradoId,
        String numeroSinistro,
        String nomeArquivo,
        TipoDocumento tipoDocumento,
        Instant dataUpload
) {
}
