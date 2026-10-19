package com.insurtech.sinistros.infrastructure.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroAprovadoEvent;
import com.insurtech.sinistros.domain.event.SinistroDocumentoAdicionadoEvent;
import com.insurtech.sinistros.domain.event.SinistroDocumentoSolicitadoEvent;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;
import com.insurtech.sinistros.infrastructure.cache.DashboardCacheInvalidator;
import com.insurtech.sinistros.infrastructure.persistence.outbox.OutboxEventJpaEntity;
import com.insurtech.sinistros.infrastructure.persistence.outbox.OutboxEventJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@Primary
@RequiredArgsConstructor
public class KafkaSinistroEventPublisher implements EventPublisherPort {

    private final OutboxEventJpaRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final DashboardCacheInvalidator cacheInvalidator;

    private static final String TOPIC_REGISTRADO             = "sinistro.registrado";
    private static final String TOPIC_APROVADO               = "sinistro.aprovado";
    private static final String TOPIC_REJEITADO              = "sinistro.rejeitado";
    private static final String TOPIC_DOCUMENTOS_SOLICITADOS = "sinistro.documentos-solicitados";
    private static final String TOPIC_DOCUMENTO_ADICIONADO   = "sinistro.documento-adicionado";

    private void enfileirarNoOutbox(String topic, String aggregateId, Object event) {
        try {
            String payloadJson = objectMapper.writeValueAsString(event);
            String correlationId = MDC.get("correlationId");

            OutboxEventJpaEntity outbox = new OutboxEventJpaEntity();
            outbox.setId(UUID.randomUUID());
            outbox.setAggregateType("SINISTRO");
            outbox.setAggregateId(aggregateId);
            outbox.setTopic(topic);
            outbox.setPayload(payloadJson);
            outbox.setCorrelationId(correlationId);
            outbox.setStatus("PENDENTE");
            outbox.setTentativas(0);
            outbox.setCreatedAt(Instant.now());

            outboxRepository.save(outbox);
            log.info("[OUTBOX-ENQUEUE] Evento salvo no outbox: id={} | topico={} | correlationId={}",
                    outbox.getId(), topic, correlationId);
        } catch (Exception e) {
            log.error("[OUTBOX-ERROR] Falha ao serializar evento para outbox", e);
            throw new RuntimeException("Erro ao salvar evento no Outbox", e);
        }
    }

    @Override
    public void publicarSinistroRegistrado(SinistroRegistradoEvent event) {
        enfileirarNoOutbox(TOPIC_REGISTRADO, event.sinistroId().toString(), event);
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarSinistroAprovado(SinistroAprovadoEvent event) {
        enfileirarNoOutbox(TOPIC_APROVADO, event.sinistroId().toString(), event);
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarSinistroRejeitado(SinistroRejeitadoEvent event) {
        enfileirarNoOutbox(TOPIC_REJEITADO, event.sinistroId().toString(), event);
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarDocumentoSolicitado(SinistroDocumentoSolicitadoEvent event) {
        enfileirarNoOutbox(TOPIC_DOCUMENTOS_SOLICITADOS, event.sinistroId().toString(), event);
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarDocumentoAdicionado(SinistroDocumentoAdicionadoEvent event) {
        enfileirarNoOutbox(TOPIC_DOCUMENTO_ADICIONADO, event.sinistroId().toString(), event);
        cacheInvalidator.invalidar();
    }
}