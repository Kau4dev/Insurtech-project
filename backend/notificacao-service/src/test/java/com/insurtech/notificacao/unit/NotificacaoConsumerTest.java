package com.insurtech.notificacao.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.notificacao.application.usecase.NotificarPagamentoLiquidadoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarSinistroRegistradoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarSinistroRejeitadoUseCase;
import com.insurtech.notificacao.infrastructure.messaging.NotificacaoConsumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificacaoConsumerTest {

    private ObjectMapper objectMapper;

    @Mock
    private NotificarSinistroRegistradoUseCase notificarSinistroRegistradoUseCase;

    @Mock
    private NotificarSinistroRejeitadoUseCase notificarSinistroRejeitadoUseCase;

    @Mock
    private NotificarPagamentoLiquidadoUseCase notificarPagamentoLiquidadoUseCase;

    private NotificacaoConsumer consumer;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        consumer = new NotificacaoConsumer(
                objectMapper,
                notificarSinistroRegistradoUseCase,
                notificarSinistroRejeitadoUseCase,
                notificarPagamentoLiquidadoUseCase
        );
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
        verify(notificarSinistroRegistradoUseCase).executar(any());
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
        verify(notificarSinistroRejeitadoUseCase).executar(any());
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
        verify(notificarPagamentoLiquidadoUseCase).executar(any());
    }
}
