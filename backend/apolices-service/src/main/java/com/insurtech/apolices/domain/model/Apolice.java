package com.insurtech.apolices.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Apolice {

    private UUID id;
    private UUID seguradoId;
    private String numeroApolice;
    private TipoSeguro tipoSeguro;
    private BigDecimal valorSegurodo;
    private BigDecimal valorPremio;
    private LocalDate dataInicioVigencia;
    private LocalDate dataFimVigencia;
    private Status status;
    private Instant createdAt;
    private Instant updatedAt;
}
