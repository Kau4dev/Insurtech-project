package com.insurtech.liquidacao.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class EventoPagamento {

    private UUID id;
    private UUID sinistroId;
    private BigDecimal valorLiquidado;
    private Status status;
    private Instant dataProcessamento;
    private String eventoIdOrigem;
    private Instant createdAt;

    public void processar(){
        if (!Status.PENDENTE.equals(this.status)) {
            throw new IllegalStateException("Pagamento já foi processado");
        }
        this.status = Status.PROCESSADO;
        this.dataProcessamento = Instant.now();
    }

    public void falhar(){
        this.status = Status.FALHOU;
        this.dataProcessamento = Instant.now();
    }

}
