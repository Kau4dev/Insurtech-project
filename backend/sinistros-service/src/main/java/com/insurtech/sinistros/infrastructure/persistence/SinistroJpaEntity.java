package com.insurtech.sinistros.infrastructure.persistence;

import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "sinistros")
@Getter
@Setter
@NoArgsConstructor
public class SinistroJpaEntity {

    @Id
    private UUID id;

    @Column(name = "numero_sinistro", nullable = false, unique = true)
    private String numeroSinistro;

    @Column(name = "apolice_id", nullable = false)
    private UUID apoliceId;

    @Column(name = "segurado_id", nullable = false)
    private UUID seguradoId;

    @Column(name = "analista_id")
    private UUID analistaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sinistro", nullable = false)
    private TipoSinistro tipoSinistro;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_ocorrencia", nullable = false)
    private LocalDate dataOcorrencia;

    @Column(name = "data_registro", nullable = false, insertable = false, updatable = false)
    private Instant dataRegistro;

    @Column(name = "valor_estimado", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorEstimado;

    @Column(name = "valor_aprovado", precision = 14, scale = 2)
    private BigDecimal valorAprovado;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "motivo_rejeicao", columnDefinition = "TEXT")
    private String motivoRejeicao;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

}
