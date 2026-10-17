package com.insurtech.sinistros.unit.infrastructure.messaging.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.sinistros.infrastructure.messaging.outbox.OutboxEventRelay;
import com.insurtech.sinistros.infrastructure.persistence.outbox.OutboxEventJpaEntity;
import com.insurtech.sinistros.infrastructure.persistence.outbox.OutboxEventJpaRepository;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxEventRelayTest {

    @Mock
    private OutboxEventJpaRepository outboxRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private OutboxEventRelay relay;

    @BeforeEach
    void setup() {
        relay = new OutboxEventRelay(outboxRepository, kafkaTemplate, new ObjectMapper());
    }

    private OutboxEventJpaEntity eventoPendente(int tentativas) {
        OutboxEventJpaEntity evento = new OutboxEventJpaEntity();
        evento.setId(UUID.randomUUID());
        evento.setAggregateType("SINISTRO");
        evento.setAggregateId(UUID.randomUUID().toString());
        evento.setTopic("sinistro.aprovado");
        evento.setPayload("{\"sinistroId\":\"" + UUID.randomUUID() + "\"}");
        evento.setCorrelationId("corr-123");
        evento.setStatus("PENDENTE");
        evento.setTentativas(tentativas);
        evento.setCreatedAt(Instant.now());
        return evento;
    }

    @Test
    @DisplayName("Deve publicar evento pendente no Kafka e marcar status como processado")
    @SuppressWarnings("unchecked")
    void devePublicarEventoPendenteEMarcarComoProcessado() {
        OutboxEventJpaEntity evento = eventoPendente(0);
        when(outboxRepository.findEventosPendentes(any(Pageable.class))).thenReturn(List.of(evento));
        when(kafkaTemplate.send(any(ProducerRecord.class)))
                .thenReturn((CompletableFuture<SendResult<String, Object>>) (CompletableFuture<?>) CompletableFuture.completedFuture(null));

        relay.processarEventosPendentes();

        assertEquals("PROCESSADO", evento.getStatus());
        assertNotNull(evento.getProcessedAt());
        assertNull(evento.getErro());
        verify(outboxRepository).save(evento);
    }

    @Test
    @DisplayName("Deve marcar evento como falha após exceder o número máximo de tentativas")
    @SuppressWarnings("unchecked")
    void deveMarcarComoFalhaAposExcederMaximoDeTentativas() {
        OutboxEventJpaEntity evento = eventoPendente(4); // +1 tentativa atinge o máximo (5)
        when(outboxRepository.findEventosPendentes(any(Pageable.class))).thenReturn(List.of(evento));
        when(kafkaTemplate.send(any(ProducerRecord.class)))
                .thenReturn((CompletableFuture<SendResult<String, Object>>) (CompletableFuture<?>) CompletableFuture.failedFuture(new RuntimeException("kafka down")));

        relay.processarEventosPendentes();

        assertEquals(5, evento.getTentativas());
        assertEquals("FALHA", evento.getStatus());
        assertEquals("kafka down", evento.getErro());
        verify(outboxRepository).save(evento);
    }

    @Test
    @DisplayName("Não deve interagir com o Kafka quando não houver eventos pendentes no outbox")
    void naoDeveInteragirComKafkaQuandoNaoHaEventosPendentes() {
        when(outboxRepository.findEventosPendentes(any(Pageable.class))).thenReturn(List.of());

        relay.processarEventosPendentes();

        verifyNoInteractions(kafkaTemplate);
        verify(outboxRepository, never()).save(any());
    }
}
