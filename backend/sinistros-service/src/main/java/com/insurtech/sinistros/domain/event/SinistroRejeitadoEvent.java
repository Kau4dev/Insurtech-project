package com.insurtech.sinistros.domain.event;

import java.util.UUID;

public record SinistroRejeitadoEvent(
        UUID sinistroId,
        UUID seguradoId,
        String motivoRejeicao
) {}