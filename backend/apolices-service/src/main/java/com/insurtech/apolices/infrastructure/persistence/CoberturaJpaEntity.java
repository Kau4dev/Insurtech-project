package com.insurtech.apolices.infrastructure.persistence;

import com.insurtech.apolices.domain.model.TipoCobertura;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "coberturas")
@Getter
@Setter
@NoArgsConstructor
public class CoberturaJpaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apolice_id")
    private ApoliceJpaEntity apolice;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cobertura", nullable = false, length = 50)
    private TipoCobertura tipoCobertura;

    @Column(name = "valor_cobertura", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorCobertura;

    @Column(name = "valor_franquia", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorFranquia;
}
