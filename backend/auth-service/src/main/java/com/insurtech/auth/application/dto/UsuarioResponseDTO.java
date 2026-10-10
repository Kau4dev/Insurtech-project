package com.insurtech.auth.application.dto;

import com.insurtech.auth.domain.model.Papel;

import java.time.Instant;
import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        Papel papel,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {
    public UsuarioResponseDTO(UUID id, String nome, String email, Papel papel, Boolean ativo) {
        this(id, nome, email, papel, ativo, null, null);
    }
}
