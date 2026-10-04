package com.insurtech.segurados.infrastructure.client.dto;

import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        Papel papel,
        Boolean ativo
) {
}
