package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.application.usecase.MostrarMetricasUseCase;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.security.UserContext;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MostrarMetricasUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @InjectMocks
    private MostrarMetricasUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    @Test
    void deveMostrarMetricas_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

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
    void deveMostrarMetricas_comSucesso_comoAdmin() {
        setUserContext(UUID.randomUUID().toString(), "ADMIN");

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

    @Test
    void deveMostrarMetricas_comValoresNulosNoRepositorio() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

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

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        // Contexto vazio
        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar());
        verifyNoInteractions(repository);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido_analista() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        assertThrows(AcessoNegadoException.class, () -> useCase.executar());
        verifyNoInteractions(repository);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido_segurado() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");
        assertThrows(AcessoNegadoException.class, () -> useCase.executar());
        verifyNoInteractions(repository);
    }
}
