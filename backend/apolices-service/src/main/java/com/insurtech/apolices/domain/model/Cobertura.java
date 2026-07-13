package com.insurtech.apolices.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Cobertura {

    private UUID id;
    private UUID apoliceId;
    private String tipoCobertura;
    private BigDecimal valorCobertura;
    private BigDecimal valorFranquia;

}
