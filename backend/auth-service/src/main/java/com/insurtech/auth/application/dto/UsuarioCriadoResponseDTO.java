package com.insurtech.auth.application.dto;

import com.insurtech.auth.domain.model.Papel;

import java.time.Instant;
import java.util.UUID;

public record UsuarioCriadoResponseDTO(
        UUID id,
        String nome,
        String email,
        Papel papel,
        Boolean ativo,
        String senhaTemporaria,
        Instant createdAt
) {
}
