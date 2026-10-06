package com.insurtech.sinistros.unit.infrastructure.persistence;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.persistence.MetricasQueryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetricasQueryServiceTest {

    @Mock
    private SinistroRepository repository;

    @InjectMocks
    private MetricasQueryService service;

    @Test
    void deveCalcularResumoComSucesso() {
        Map<Status, Long> contagem = Map.of(Status.EM_ANALISE, 2L, Status.APROVADO, 3L);
        when(repository.contarPorStatus()).thenReturn(contagem);
        when(repository.somarValorEstimadoPorStatus(Status.EM_ANALISE)).thenReturn(new BigDecimal("1500.50"));
        when(repository.somarValorAprovadoPorStatus(List.of(Status.APROVADO, Status.PAGO)))
                .thenReturn(new BigDecimal("3000.00"));

        DashboardResponseDTO resumo = service.calcularResumo();

        assertNotNull(resumo);
        assertEquals(5L, resumo.TotalSinistros());
        assertEquals(new BigDecimal("1500.50"), resumo.ValorTotalEmAnalise());
        assertEquals(new BigDecimal("3000.00"), resumo.ValorTotalAprovado());
        assertEquals(contagem, resumo.contagemPorStatus());
    }

    @Test
    void deveCalcularResumoTratandoValoresNulosDoRepositorio() {
        Map<Status, Long> contagem = Map.of(Status.REGISTRADO, 1L);
        when(repository.contarPorStatus()).thenReturn(contagem);
        when(repository.somarValorEstimadoPorStatus(Status.EM_ANALISE)).thenReturn(null);
        when(repository.somarValorAprovadoPorStatus(List.of(Status.APROVADO, Status.PAGO))).thenReturn(null);

        DashboardResponseDTO resumo = service.calcularResumo();

        assertNotNull(resumo);
        assertEquals(1L, resumo.TotalSinistros());
        assertEquals(BigDecimal.ZERO, resumo.ValorTotalEmAnalise());
        assertEquals(BigDecimal.ZERO, resumo.ValorTotalAprovado());
    }
}
