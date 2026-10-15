package com.insurtech.segurados.infrastructure.client.dto;

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
