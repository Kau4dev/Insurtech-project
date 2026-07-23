package com.insurtech.liquidacao.domain.repository;

import com.insurtech.liquidacao.domain.model.EventoPagamento;

public interface EventoPagamentoRepository {

    EventoPagamento salvar(EventoPagamento eventoPagamento);

    boolean existePorEventoIdOrigem(String eventoIdOrigem);
}
