package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.application.usecase.MostrarMetricasUseCase;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.infrastructure.persistence.MetricasQueryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MostrarMetricasUseCaseTest {

    @Mock
    private MetricasQueryService metricasQueryService;

    @Mock
    private SinistroSecurityValidator securityValidator;

    @InjectMocks
    private MostrarMetricasUseCase useCase;

    @Test
    void deveMostrarMetricas_comSucesso() {
        DashboardResponseDTO esperado = new DashboardResponseDTO(
                Map.of(Status.EM_ANALISE, 2L, Status.APROVADO, 3L),
                new BigDecimal("1000.00"),
                new BigDecimal("2000.00"),
                5L
        );
        when(metricasQueryService.calcularResumo()).thenReturn(esperado);

        DashboardResponseDTO resultado = useCase.executar();

        assertNotNull(resultado);
        assertEquals(5L, resultado.TotalSinistros());
        assertEquals(new BigDecimal("1000.00"), resultado.ValorTotalEmAnalise());
        assertEquals(new BigDecimal("2000.00"), resultado.ValorTotalAprovado());
        verify(securityValidator, times(1)).validarPapeis(anyString(), eq("GESTOR"), eq("ADMIN"));
        verify(metricasQueryService).calcularResumo();
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        doThrow(new UsuarioNaoAutenticadoException("Usuário não autenticado"))
                .when(securityValidator).validarPapeis(anyString(), eq("GESTOR"), eq("ADMIN"));

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar());
        verifyNoInteractions(metricasQueryService);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        doThrow(new AcessoNegadoException("Acesso negado."))
                .when(securityValidator).validarPapeis(anyString(), eq("GESTOR"), eq("ADMIN"));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar());
        verifyNoInteractions(metricasQueryService);
    }
}
