package com.insurtech.liquidacao.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class EventoPagamento {

    private UUID id;
    private UUID sinistroId;
    private BigDecimal valorLiquidado;
    private StatusPagamento status;
    private Instant dataProcessamento;
    private String eventoIdOrigem;
    private Instant createdAt;
    private Instant updatedAt;

    public void processar(){
        if (!StatusPagamento.PENDENTE.equals(this.status)) {
            throw new IllegalStateException("Pagamento já foi processado");
        }
        this.updatedAt = Instant.now();
        this.status = StatusPagamento.PROCESSADO;
        this.dataProcessamento = Instant.now();
    }

    public void falhar(){
        this.status = StatusPagamento.FALHOU;
        this.dataProcessamento = Instant.now();
    }

}
