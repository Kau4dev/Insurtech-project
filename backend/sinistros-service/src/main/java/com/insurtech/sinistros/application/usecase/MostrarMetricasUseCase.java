package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.DashboardResponseDTO;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.infrastructure.persistence.MetricasQueryService;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MostrarMetricasUseCase {

    private final MetricasQueryService metricasQueryService;

    public DashboardResponseDTO executar() {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas gestores ou administradores podem visualizar o dashboard.");
        }

        return metricasQueryService.calcularResumo();
    }
}