package com.insurtech.segurados.application.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        int status,
        String message,
        String path,
        Map<String, String> errors,
        LocalDateTime timestamp
) {}