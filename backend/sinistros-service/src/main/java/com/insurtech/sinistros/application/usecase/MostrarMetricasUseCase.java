package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MostrarMetricasUseCase {

    private final SinistroRepository repository;

    public DashboardResponseDTO executar() {

        Map<Status, Long> contagemPorStatus = repository.contarPorStatus();

        long totalSinistros = contagemPorStatus.values()
                .stream()
                .mapToLong(Long::longValue)
                .sum();

        BigDecimal valorTotalEmAnalise = repository
                .somarValorEstimadoPorStatus(Status.EM_ANALISE);

        BigDecimal valorTotalAprovado = repository
                .somarValorAprovadoPorStatus(List.of(Status.APROVADO, Status.PAGO));

        return new DashboardResponseDTO(
                contagemPorStatus,
                valorTotalEmAnalise != null ? valorTotalEmAnalise : BigDecimal.ZERO,
                valorTotalAprovado != null ? valorTotalAprovado : BigDecimal.ZERO,
                totalSinistros
        );
    }
}