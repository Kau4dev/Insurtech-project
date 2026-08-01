package com.insurtech.sinistros.infrastructure.client.dto;

import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        Papel papel
) {
}
