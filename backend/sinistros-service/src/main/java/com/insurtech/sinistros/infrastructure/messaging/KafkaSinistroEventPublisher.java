package com.insurtech.sinistros.infrastructure.messaging;

import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroAprovadoEvent;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaSinistroEventPublisher implements EventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_REGISTRADO = "sinistro.registrado";
    private static final String TOPIC_APROVADO   = "sinistro.aprovado";
    private static final String TOPIC_REJEITADO  = "sinistro.rejeitado";

    @Override
    public void publicarSinistroRegistrado(SinistroRegistradoEvent event) {
        log.info("Publicando evento SinistroRegistrado para sinistroId: {}", event.sinistroId());
        kafkaTemplate.send(TOPIC_REGISTRADO, event.sinistroId().toString(), event);
    }

    @Override
    public void publicarSinistroAprovado(SinistroAprovadoEvent event) {
        log.info("Publicando evento SinistroAprovado para sinistroId: {}", event.sinistroId());
        kafkaTemplate.send(TOPIC_APROVADO, event.sinistroId().toString(), event);
    }

    @Override
    public void publicarSinistroRejeitado(SinistroRejeitadoEvent event) {
        log.info("Publicando evento SinistroRejeitado para sinistroId: {}", event.sinistroId());
        kafkaTemplate.send(TOPIC_REJEITADO, event.sinistroId().toString(), event);
    }
}