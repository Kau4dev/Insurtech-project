package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.infrastructure.persistence.MetricasQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MostrarMetricasUseCase {

    private final MetricasQueryService metricasQueryService;
    private final SinistroSecurityValidator securityValidator;

    public DashboardResponseDTO executar() {
        securityValidator.validarPapeis(
                "Acesso negado. Apenas gestores ou administradores podem visualizar o dashboard.",
                "GESTOR", "ADMIN"
        );

        return metricasQueryService.calcularResumo();
    }
}