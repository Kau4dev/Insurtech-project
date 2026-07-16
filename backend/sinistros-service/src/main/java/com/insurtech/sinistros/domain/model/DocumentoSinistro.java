package com.insurtech.sinistros.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class DocumentoSinistro {

    private UUID id;
    private UUID sinistroId;
    private TipoDocumento tipoDocumento;
    private String nomeArquivo;
    private String urlArquivo;
    private Instant dataUpload;

    public void validar() {
        if (sinistroId == null) {
            throw new IllegalArgumentException("ID do sinistro é obrigatório");
        }
        if (tipoDocumento == null) {
            throw new IllegalArgumentException("Tipo de documento é obrigatório");
        }
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            throw new IllegalArgumentException("Nome do arquivo é obrigatório");
        }
        if (urlArquivo == null || urlArquivo.isBlank()) {
            throw new IllegalArgumentException("URL do arquivo é obrigatória");
        }
    }
}
