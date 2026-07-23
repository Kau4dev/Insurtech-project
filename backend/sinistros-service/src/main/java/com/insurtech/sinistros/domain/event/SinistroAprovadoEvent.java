package com.insurtech.sinistros.domain.event;

import java.math.BigDecimal;
import java.util.UUID;

public record SinistroAprovadoEvent(
        UUID sinistroId,
        UUID seguradoId,
        BigDecimal valorAprovado
) {}