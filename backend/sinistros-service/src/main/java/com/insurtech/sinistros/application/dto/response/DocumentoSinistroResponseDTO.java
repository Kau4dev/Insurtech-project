package com.insurtech.sinistros.application.dto.response;

import com.insurtech.sinistros.domain.model.TipoDocumento;

import java.time.Instant;
import java.util.UUID;

public record DocumentoSinistroResponseDTO(
        UUID id,
        TipoDocumento tipoDocumento,
        String nomeArquivo,
        String urlArquivo,
        Instant dataUpload

) {
}
