package com.insurtech.liquidacao.infrastructure.persistence;

import com.insurtech.liquidacao.domain.model.EventoPagamento;
import com.insurtech.liquidacao.domain.repository.EventoPagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class EventoPagamentoRepositoryImpl implements EventoPagamentoRepository {

    private final EventoPagamentoJpaRepository jpaRepository;

    @Override
    public EventoPagamento salvar(EventoPagamento pagamento) {
        EventoPagamentoJpaEntity entity = toEntity(pagamento);
        EventoPagamentoJpaEntity salvo = jpaRepository.save(entity);
        return toDomain(salvo);
    }

    @Override
    public boolean existePorEventoIdOrigem(String eventoIdOrigem) {
        return jpaRepository.existsByEventoIdOrigem(eventoIdOrigem);
    }

    private EventoPagamentoJpaEntity toEntity(EventoPagamento pagamento) {
        EventoPagamentoJpaEntity entity = new EventoPagamentoJpaEntity();
        entity.setId(pagamento.getId());
        entity.setSinistroId(pagamento.getSinistroId());
        entity.setValorLiquidado(pagamento.getValorLiquidado());
        entity.setStatus(pagamento.getStatus());
        entity.setEventoIdOrigem(pagamento.getEventoIdOrigem());
        entity.setDataProcessamento(pagamento.getDataProcessamento());
        entity.setCreatedAt(pagamento.getCreatedAt());
        return entity;
    }

    private EventoPagamento toDomain(EventoPagamentoJpaEntity entity) {
        EventoPagamento pagamento = new EventoPagamento();
        pagamento.setId(entity.getId());
        pagamento.setSinistroId(entity.getSinistroId());
        pagamento.setValorLiquidado(entity.getValorLiquidado());
        pagamento.setStatus(entity.getStatus());
        pagamento.setEventoIdOrigem(entity.getEventoIdOrigem());
        pagamento.setDataProcessamento(entity.getDataProcessamento());
        pagamento.setCreatedAt(entity.getCreatedAt());
        return pagamento;
    }
}