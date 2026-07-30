package com.insurtech.auth.application.dto;

import com.insurtech.auth.domain.model.Papel;

public record LoginResponseDTO(
    String token,
    String tipo,        // "Bearer"
    long expiresIn,     // em segundos
    Papel papel
) {}
