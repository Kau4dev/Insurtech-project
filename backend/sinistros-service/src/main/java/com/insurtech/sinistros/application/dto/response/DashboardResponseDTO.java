package com.insurtech.sinistros.application.dto.response;

import com.insurtech.sinistros.domain.model.Status;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardResponseDTO(
        Map<Status, Long> contagemPorStatus,
        BigDecimal ValorTotalEmAnalise,
        BigDecimal ValorTotalAprovado,
        Long TotalSinistros
) {
}
