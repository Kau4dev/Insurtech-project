package com.insurtech.apolices.infrastructure.persistence;

import com.insurtech.apolices.domain.model.Cobertura;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "apolices")
@Getter
@Setter
@NoArgsConstructor
public class ApoliceJpaEntity {

    @Id
    private UUID id;

    @Column(name = "segurado_id", unique = true)
    private UUID seguradoId;

    @Column(name = "numero_apolice", unique = true, nullable = false, length = 50)
    private String numeroApolice;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_seguro", nullable = false, length = 30)
    private TipoSeguro tipoSeguro;

    @Column(name = "valor_seguro", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorSeguro;

    @Column(name = "valor_premio", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorPremio;

    @Column(name = "data_inicio_vigencia", nullable = false)
    private LocalDate dataInicioVigencia;

    @Column(name = "data_fim_vigencia", nullable = false)
    private LocalDate dataFimVigencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;

    @OneToMany(mappedBy = "apolice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CoberturaJpaEntity> coberturas = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

}
