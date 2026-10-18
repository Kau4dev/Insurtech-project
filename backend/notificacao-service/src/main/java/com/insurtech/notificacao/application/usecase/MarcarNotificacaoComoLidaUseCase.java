package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
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
        notificacao.marcarComoLida();
        repository.salvar(notificacao);
    }

    public void executarMarcarTodas(UUID seguradoId) {
        if (seguradoId != null) {
            repository.marcarTodasComoLidasPorSegurado(seguradoId);
        } else {
            repository.marcarTodasComoLidas();
        }
    }
}

