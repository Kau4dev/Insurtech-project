package com.insurtech.liquidacao.infrastructure.persistence;

import com.insurtech.liquidacao.domain.model.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "eventos_pagamento")
@Getter
@Setter
@NoArgsConstructor
public class EventoPagamentoJpaEntity {

    @Id
    private UUID id;

    @Column(name = "sinistro_id", nullable = false)
    private UUID sinistroId;

    @Column(name = "valor_liquidado", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorLiquidado;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "data_processamento")
    private Instant dataProcessamento;

    @Column(name = "evento_id_origem")
    private String eventoIdOrigem;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

}
