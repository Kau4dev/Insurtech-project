package com.insurtech.sinistros.infrastructure.persistence;

import com.insurtech.sinistros.domain.model.TipoDocumento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documentos_sinistro")
@Getter
@Setter
@NoArgsConstructor
public class DocumentoSinistroJpaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sinistro_id", nullable = false)
    private SinistroJpaEntity sinistro;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "nome_arquivo", nullable = false)
    private String nomeArquivo;

    @Column(name = "url_arquivo", nullable = false)
    private String urlArquivo;

    @Column(name = "data_upload", nullable = false)
    private Instant dataUpload;
}
