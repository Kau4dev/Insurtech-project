package com.insurtech.notificacao.integration;

import com.insurtech.notificacao.infrastructure.messaging.NotificacaoConsumer;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.time.Duration;
import java.util.UUID;

import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.contains;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(partitions = 1)
@ActiveProfiles("test")
class NotificacaoConsumerIT {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @MockitoSpyBean
    private NotificacaoConsumer consumer;

    @Test
    void deveConsumirEventoSinistroRegistradoEDispararNotificacao() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String payload = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"numeroSinistro\":\"SIN-IT-123\"}",
                sinistroId, seguradoId
        );

        kafkaTemplate.send("sinistro.registrado", payload);

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Mockito.verify(consumer).consumirRegistrado(contains("SIN-IT-123"));
        });
    }

    @Test
    void deveConsumirEventoSinistroRejeitadoEDispararNotificacao() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String payload = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"motivoRejeicao\":\"Falta de comprovantes\"}",
                sinistroId, seguradoId
        );

        kafkaTemplate.send("sinistro.rejeitado", payload);

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Mockito.verify(consumer).consumirRejeitado(contains("Falta de comprovantes"));
        });
    }

    @Test
    void deveConsumirEventoPagamentoLiquidadoEDispararNotificacao() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String payload = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"valorLiquidado\":12500.50,\"status\":\"PROCESSADO\"}",
                sinistroId, seguradoId
        );

        kafkaTemplate.send("pagamento.liquidado", payload);

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Mockito.verify(consumer).consumirLiquidacao(contains("PROCESSADO"));
        });
    }
}
