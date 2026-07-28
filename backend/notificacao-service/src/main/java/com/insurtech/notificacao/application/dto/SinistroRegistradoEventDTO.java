package com.insurtech.notificacao.application.dto;

import java.util.UUID;

public record SinistroRegistradoEventDTO(
        UUID sinistroId,
        UUID seguradoId,
        String numeroSinistro
) {}
