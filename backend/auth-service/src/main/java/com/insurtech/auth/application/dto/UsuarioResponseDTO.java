package com.insurtech.auth.application.dto;

import com.insurtech.auth.domain.model.Papel;

import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        Papel papel
) {
}
