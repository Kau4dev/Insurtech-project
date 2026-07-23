package com.insurtech.liquidacao.infrastructure.messaging;

import com.insurtech.liquidacao.application.dto.SinistroAprovadoEventDTO;
import com.insurtech.liquidacao.application.usecase.ProcessarLiquidacaoUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SinistroAprovadoConsumer {

    private final ProcessarLiquidacaoUseCase useCase;

    @KafkaListener(
            topics = "sinistro.aprovado",
            groupId = "liquidacao-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumir(
            ConsumerRecord<String, SinistroAprovadoEventDTO> record) {

        log.info("Evento recebido: sinistroId={}", record.value().sinistroId());

        String eventoIdOrigem = record.topic() + "-" +
                record.partition() + "-" +
                record.offset();

        useCase.executar(record.value(), eventoIdOrigem);
    }
}