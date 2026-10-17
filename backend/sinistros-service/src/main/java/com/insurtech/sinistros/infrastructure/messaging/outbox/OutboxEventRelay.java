package com.insurtech.sinistros.infrastructure.messaging.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.sinistros.infrastructure.persistence.outbox.OutboxEventJpaEntity;
import com.insurtech.sinistros.infrastructure.persistence.outbox.OutboxEventJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.MDC;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventRelay {

    private final OutboxEventJpaRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final int BATCH_SIZE = 50;
    private static final int MAX_TENTATIVAS = 5;

    @Scheduled(fixedDelayString = "${outbox.poll.interval-ms:2000}")
    @Transactional
    public void processarEventosPendentes() {
        List<OutboxEventJpaEntity> pendentes = outboxRepository.findEventosPendentes(PageRequest.of(0, BATCH_SIZE));

        if (pendentes.isEmpty()) {
            return;
        }

        log.debug("[OUTBOX-RELAY] Processando lote de {} eventos pendentes", pendentes.size());

        for (OutboxEventJpaEntity evento : pendentes) {
            // Restaura o Correlation ID no MDC para os logs do Relay
            if (evento.getCorrelationId() != null && !evento.getCorrelationId().isBlank()) {
                MDC.put("correlationId", evento.getCorrelationId());
            } else {
                MDC.put("correlationId", "outbox-relay");
            }

            try {
                // O payload está persistido como JSON; converte para árvore para o JsonSerializer
                // emitir um objeto JSON (e não uma string JSON entre aspas) no tópico.
                Object payload = objectMapper.readTree(evento.getPayload());

                // Cria o ProducerRecord e preserva o header de rastreamento distribuído
                ProducerRecord<String, Object> record = new ProducerRecord<>(
                        evento.getTopic(),
                        evento.getAggregateId(),
                        payload
                );
                if (evento.getCorrelationId() != null && !evento.getCorrelationId().isBlank()) {
                    record.headers().add("X-Correlation-Id", evento.getCorrelationId().getBytes(StandardCharsets.UTF_8));
                }

                kafkaTemplate.send(record)
                        .whenComplete((result, ex) -> {
                            if (ex != null) {
                                log.error("[OUTBOX-RELAY-FAIL] Erro ao enviar evento id={}", evento.getId(), ex);
                                evento.setTentativas(evento.getTentativas() + 1);
                                evento.setErro(ex.getMessage());
                                if (evento.getTentativas() >= MAX_TENTATIVAS) {
                                    evento.setStatus("FALHA");
                                }
                            } else {
                                evento.setStatus("PROCESSADO");
                                evento.setProcessedAt(Instant.now());
                                evento.setErro(null);
                                log.info("[OUTBOX-RELAY-SUCCESS] Evento publicado no Kafka com sucesso! id={} | topico={}",
                                        evento.getId(), evento.getTopic());
                            }
                            outboxRepository.save(evento);
                        });
            } catch (Exception e) {
                log.error("[OUTBOX-RELAY-EXCEPTION] Erro ao despachar evento id={}", evento.getId(), e);
                evento.setTentativas(evento.getTentativas() + 1);
                evento.setErro(e.getMessage());
                if (evento.getTentativas() >= MAX_TENTATIVAS) {
                    evento.setStatus("FALHA");
                }
                outboxRepository.save(evento);
            } finally {
                MDC.clear();
            }
        }
    }
}