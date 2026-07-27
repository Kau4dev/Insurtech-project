package com.insurtech.liquidacao.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SinistroAprovadoEventDTO(
        UUID sinistroId,
        UUID seguradoId,
        BigDecimal valorAprovado
) {}
