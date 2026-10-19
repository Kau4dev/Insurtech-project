package com.insurtech.notificacao.domain.repository;

import com.insurtech.notificacao.domain.model.Notificacao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificacaoRepository {
    Notificacao salvar(Notificacao notificacao);
    Optional<Notificacao> buscarPorId(UUID id);
    List<Notificacao> listarPorSeguradoId(UUID seguradoId, Boolean apenasNaoLidas);
    List<Notificacao> listarTodas(Boolean apenasNaoLidas);
    void marcarTodasComoLidasPorSegurado(UUID seguradoId);
    void marcarTodasComoLidasInterno();
    void marcarTodasComoLidas();
}

