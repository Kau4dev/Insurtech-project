package com.insurtech.sinistros.infrastructure.messaging;

import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroAprovadoEvent;
import com.insurtech.sinistros.domain.event.SinistroDocumentoAdicionadoEvent;
import com.insurtech.sinistros.domain.event.SinistroDocumentoSolicitadoEvent;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;
import com.insurtech.sinistros.infrastructure.cache.DashboardCacheInvalidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.MDC;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaSinistroEventPublisher implements EventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final DashboardCacheInvalidator cacheInvalidator;

    private static final String TOPIC_REGISTRADO             = "sinistro.registrado";
    private static final String TOPIC_APROVADO               = "sinistro.aprovado";
    private static final String TOPIC_REJEITADO              = "sinistro.rejeitado";
    private static final String TOPIC_DOCUMENTOS_SOLICITADOS = "sinistro.documentos-solicitados";
    private static final String TOPIC_DOCUMENTO_ADICIONADO   = "sinistro.documento-adicionado";

    private ProducerRecord<String, Object> criarRecordComHeader(String topic, String key, Object payload) {
        ProducerRecord<String, Object> record = new ProducerRecord<>(topic, key, payload);
        String correlationId = MDC.get("correlationId");
        if (correlationId != null && !correlationId.isBlank()) {
            record.headers().add("X-Correlation-Id", correlationId.getBytes(StandardCharsets.UTF_8));
        }
        return record;
    }

    @Override
    public void publicarSinistroRegistrado(SinistroRegistradoEvent event) {
        log.info("[KAFKA-PRODUCE] Publicando SinistroRegistrado sinistroId={}", event.sinistroId());
        kafkaTemplate.send(criarRecordComHeader(TOPIC_REGISTRADO, event.sinistroId().toString(), event));
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarSinistroAprovado(SinistroAprovadoEvent event) {
        log.info("[KAFKA-PRODUCE] Publicando SinistroAprovado sinistroId={}", event.sinistroId());
        kafkaTemplate.send(criarRecordComHeader(TOPIC_APROVADO, event.sinistroId().toString(), event))
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("[KAFKA-ERROR] Erro ao publicar SinistroAprovado", ex);
                    } else {
                        log.info("[KAFKA-PRODUCE] Sucesso topico={}", result.getRecordMetadata().topic());
                    }
                });
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarSinistroRejeitado(SinistroRejeitadoEvent event) {
        log.info("[KAFKA-PRODUCE] Publicando SinistroRejeitado sinistroId={}", event.sinistroId());
        kafkaTemplate.send(criarRecordComHeader(TOPIC_REJEITADO, event.sinistroId().toString(), event));
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarDocumentoSolicitado(SinistroDocumentoSolicitadoEvent event) {
        log.info("[KAFKA-PRODUCE] Publicando SinistroDocumentosSolicitados sinistroId={}", event.sinistroId());
        kafkaTemplate.send(criarRecordComHeader(TOPIC_DOCUMENTOS_SOLICITADOS, event.sinistroId().toString(), event));
        cacheInvalidator.invalidar();
    }

    @Override
    public void publicarDocumentoAdicionado(SinistroDocumentoAdicionadoEvent event) {
        log.info("[KAFKA-PRODUCE] Publicando SinistroDocumentoAdicionado sinistroId={}", event.sinistroId());
        kafkaTemplate.send(criarRecordComHeader(TOPIC_DOCUMENTO_ADICIONADO, event.sinistroId().toString(), event));
        cacheInvalidator.invalidar();
    }
}