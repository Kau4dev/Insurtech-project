package com.insurtech.sinistros.domain.model;

import com.insurtech.sinistros.domain.exception.NomeArquivoObrigatorioException;
import com.insurtech.sinistros.domain.exception.SinistroObrigatorioException;
import com.insurtech.sinistros.domain.exception.TipoDocumentoObrigatorioException;
import com.insurtech.sinistros.domain.exception.UrlArquivoObrigatoria;
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
            throw new SinistroObrigatorioException("ID do sinistro é obrigatório");
        }
        if (tipoDocumento == null) {
            throw new TipoDocumentoObrigatorioException("Tipo de documento é obrigatório");
        }
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            throw new NomeArquivoObrigatorioException("Nome do arquivo é obrigatório");
        }
        if (urlArquivo == null || urlArquivo.isBlank()) {
            throw new UrlArquivoObrigatoria("URL do arquivo é obrigatória");
        }
    }
}
