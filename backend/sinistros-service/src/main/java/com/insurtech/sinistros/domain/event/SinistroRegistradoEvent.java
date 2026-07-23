package com.insurtech.sinistros.domain.event;

import java.util.UUID;

public record SinistroRegistradoEvent(
        UUID sinistroId,
        UUID seguradoId,
        String numeroSinistro
) {}