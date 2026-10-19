package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import com.insurtech.notificacao.infrastructure.security.UserContext;
import com.insurtech.notificacao.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MarcarNotificacaoComoLidaUseCase {

    private final NotificacaoRepository repository;

    public void executar(UUID id) {
        Notificacao notificacao = repository.buscarPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada com o ID: " + id));

        UserContext ctx = UserContextHolder.getContext();
        String papel = ctx != null ? ctx.getUsuarioPapel() : null;
        if (papel != null && !papel.isBlank()) {
            notificacao.marcarComoLida(papel);
        } else {
            notificacao.marcarComoLida();
        }
        repository.salvar(notificacao);
    }

    public void executarMarcarTodas(UUID seguradoId) {
        UserContext ctx = UserContextHolder.getContext();
        boolean isSegurado = seguradoId != null || (ctx != null && "SEGURADO".equalsIgnoreCase(ctx.getUsuarioPapel()));

        if (isSegurado && seguradoId != null) {
            repository.marcarTodasComoLidasPorSegurado(seguradoId);
        } else if (!isSegurado && (ctx != null && ctx.getUsuarioPapel() != null)) {
            repository.marcarTodasComoLidasInterno();
        } else {
            repository.marcarTodasComoLidas();
        }
    }
}

