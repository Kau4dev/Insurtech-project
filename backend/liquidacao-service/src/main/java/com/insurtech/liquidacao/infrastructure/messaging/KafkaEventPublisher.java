package com.insurtech.liquidacao.infrastructure.messaging;

import com.insurtech.liquidacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.liquidacao.application.port.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventPublisher implements EventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_PAGAMENTO_LIQUIDADO = "pagamento.liquidado";

    @Override
    public void publicarPagamentoLiquidado(PagamentoLiquidadoEventDTO event) {
        log.info("Publicando PagamentoLiquidado para sinistroId: {}", event.sinistroId());
        kafkaTemplate.send(
                TOPIC_PAGAMENTO_LIQUIDADO,
                event.sinistroId().toString(),
                event
        );
    }
}