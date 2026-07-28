package com.insurtech.notificacao.application.dto;

import java.util.UUID;

public record SinistroRejeitadoEventDTO(
        UUID sinistroId,
        UUID seguradoId,
        String motivoRejeicao
) {}
