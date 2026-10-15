package com.insurtech.notificacao.application.dto;

import com.insurtech.notificacao.domain.model.TipoNotificacao;

import java.time.Instant;
import java.util.UUID;

public record NotificacaoResponseDTO(
        UUID id,
        UUID seguradoId,
        String titulo,
        String mensagem,
        TipoNotificacao tipo,
        boolean lida,
        Instant criadoEm
) {}

