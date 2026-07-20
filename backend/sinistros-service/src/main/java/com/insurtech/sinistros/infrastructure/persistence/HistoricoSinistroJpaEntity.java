package com.insurtech.sinistros.infrastructure.persistence;

import com.insurtech.sinistros.domain.model.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "historico_sinistro")
@Getter
@Setter
@NoArgsConstructor
public class HistoricoSinistroJpaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sinistro_id", nullable = false)
    private SinistroJpaEntity sinistro;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_anterior")
    private Status statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_novo", nullable = false)
    private Status statusNovo;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
