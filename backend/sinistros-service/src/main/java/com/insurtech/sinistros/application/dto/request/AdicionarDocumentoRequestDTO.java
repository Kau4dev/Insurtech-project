package com.insurtech.sinistros.application.dto.request;

import com.insurtech.sinistros.domain.model.TipoDocumento;
import jakarta.validation.constraints.NotNull;


public record AdicionarDocumentoRequestDTO(

        @NotNull(message = "Tipo de documento é obrigatório")
        TipoDocumento tipoDocumento,

        @NotNull(message = "Nome do arquivo é obrigatório")
        String nomeArquivo,

        @NotNull(message = "URL do arquivo é obrigatória")
        String urlArquivo
) {
}
