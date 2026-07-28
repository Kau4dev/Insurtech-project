package com.insurtech.auth.application.dto;

public record LoginResponseDTO(
    String token,
    String tipo,        // "Bearer"
    long expiresIn,     // em segundos
    String papel
) {}
