package com.insurtech.liquidacao.application.port;

import com.insurtech.liquidacao.application.dto.PagamentoLiquidadoEventDTO;

public interface EventPublisherPort {

    void publicarPagamentoLiquidado(PagamentoLiquidadoEventDTO event);
}
