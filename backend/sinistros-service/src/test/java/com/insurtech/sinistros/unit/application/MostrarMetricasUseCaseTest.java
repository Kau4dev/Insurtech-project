package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.application.usecase.MostrarMetricasUseCase;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MostrarMetricasUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @InjectMocks
    private MostrarMetricasUseCase useCase;

    @Test
    void deveMostrarMetricas_comSucesso() {
        Map<Status, Long> contagem = Map.of(Status.EM_ANALISE, 2L, Status.APROVADO, 3L);
        when(repository.contarPorStatus()).thenReturn(contagem);
        when(repository.somarValorEstimadoPorStatus(Status.EM_ANALISE)).thenReturn(new BigDecimal("1000.00"));
        when(repository.somarValorAprovadoPorStatus(List.of(Status.APROVADO, Status.PAGO))).thenReturn(new BigDecimal("2000.00"));

        DashboardResponseDTO resultado = useCase.executar();

        assertNotNull(resultado);
        assertEquals(5L, resultado.TotalSinistros());
        assertEquals(new BigDecimal("1000.00"), resultado.ValorTotalEmAnalise());
        assertEquals(new BigDecimal("2000.00"), resultado.ValorTotalAprovado());
    }

    @Test
    void deveMostrarMetricas_comValoresNulosNoRepositorio() {
        Map<Status, Long> contagem = Map.of(Status.EM_ANALISE, 2L);
        when(repository.contarPorStatus()).thenReturn(contagem);
        when(repository.somarValorEstimadoPorStatus(Status.EM_ANALISE)).thenReturn(null);
        when(repository.somarValorAprovadoPorStatus(List.of(Status.APROVADO, Status.PAGO))).thenReturn(null);

        DashboardResponseDTO resultado = useCase.executar();

        assertNotNull(resultado);
        assertEquals(2L, resultado.TotalSinistros());
        assertEquals(BigDecimal.ZERO, resultado.ValorTotalEmAnalise());
        assertEquals(BigDecimal.ZERO, resultado.ValorTotalAprovado());
    }
}
