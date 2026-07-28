package com.insurtech.notificacao.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.notificacao.infrastructure.messaging.NotificacaoConsumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
class NotificacaoConsumerTest {

    private ObjectMapper objectMapper;
    private NotificacaoConsumer consumer;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        consumer = new NotificacaoConsumer(objectMapper);
    }

    @Test
    void deveConsumirRegistradoComSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"numeroSinistro\":\"SIN-123\"}",
                sinistroId, seguradoId
        );

        assertDoesNotThrow(() -> consumer.consumirRegistrado(message));
    }

    @Test
    void deveConsumirRejeitadoComSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"motivoRejeicao\":\"Documento falso\"}",
                sinistroId, seguradoId
        );

        assertDoesNotThrow(() -> consumer.consumirRejeitado(message));
    }

    @Test
    void deveConsumirLiquidacaoComSucesso_quandoStatusProcessado() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"valorLiquidado\":15000.00,\"status\":\"PROCESSADO\"}",
                sinistroId, seguradoId
        );

        assertDoesNotThrow(() -> consumer.consumirLiquidacao(message));
    }

    @Test
    void deveConsumirLiquidacaoComSucesso_quandoStatusFalhou() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"valorLiquidado\":15000.00,\"status\":\"FALHOU\"}",
                sinistroId, seguradoId
        );

        assertDoesNotThrow(() -> consumer.consumirLiquidacao(message));
    }

    @Test
    void deveTratarErroDeDesserializacao() {
        String invalidMessage = "invalid json";

        assertDoesNotThrow(() -> consumer.consumirRegistrado(invalidMessage));
        assertDoesNotThrow(() -> consumer.consumirRejeitado(invalidMessage));
        assertDoesNotThrow(() -> consumer.consumirLiquidacao(invalidMessage));
    }
}
