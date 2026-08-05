package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
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
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas gestores ou administradores podem visualizar o dashboard.");
        }

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