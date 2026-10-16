package com.insurtech.liquidacao.infrastructure.messaging;

import com.insurtech.liquidacao.application.dto.SinistroAprovadoEventDTO;
import com.insurtech.liquidacao.application.usecase.ProcessarLiquidacaoUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SinistroAprovadoConsumer {

    private final ProcessarLiquidacaoUseCase useCase;

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(
            topics = "sinistro.aprovado",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumir(ConsumerRecord<String, SinistroAprovadoEventDTO> record) {
        org.apache.kafka.common.header.Header header = record.headers().lastHeader("X-Correlation-Id");
        String correlationId = (header != null)
                ? new String(header.value(), java.nio.charset.StandardCharsets.UTF_8)
                : java.util.UUID.randomUUID().toString();

        org.slf4j.MDC.put("correlationId", correlationId);

        try {
            log.info("[KAFKA-CONSUME] Processando liquidacao para sinistroId={}", record.value().sinistroId());

            String eventoIdOrigem = record.topic() + "-" +
                    record.partition() + "-" +
                    record.offset();

            useCase.executar(record.value(), eventoIdOrigem);
        } finally {
            org.slf4j.MDC.clear();
        }
    }

    @DltHandler
    public void processarMensagemDlt(
            ConsumerRecord<String, SinistroAprovadoEventDTO> record,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.EXCEPTION_MESSAGE) String erro
    ) {
        log.error("[DEAD LETTER TOPIC - LIQUIDACAO] Falha fatal ao processar liquidacao apos retentativas. Topico: {} | Erro: {} | Payload: {}",
                topic, erro, record.value());
    }
}