package com.insurtech.notificacao.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.notificacao.application.usecase.NotificarDocumentoRecebidoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarDocumentoSolicitadoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarPagamentoLiquidadoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarSinistroRegistradoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarSinistroRejeitadoUseCase;
import com.insurtech.notificacao.infrastructure.messaging.NotificacaoConsumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.apache.kafka.clients.consumer.ConsumerRecord;

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
    private NotificarDocumentoSolicitadoUseCase notificarDocumentoSolicitadoUseCase;

    @Mock
    private NotificarDocumentoRecebidoUseCase notificarDocumentoRecebidoUseCase;

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
                notificarDocumentoSolicitadoUseCase,
                notificarDocumentoRecebidoUseCase,
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
        org.apache.kafka.common.header.internals.RecordHeaders headers = new org.apache.kafka.common.header.internals.RecordHeaders();
        headers.add("X-Correlation-Id", "corr-test-123".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        ConsumerRecord<String, String> record = new ConsumerRecord<>(
                "sinistro.registrado", 0, 0L, 0L, null, 0, 0,
                sinistroId.toString(), message, headers, java.util.Optional.empty()
        );

        assertDoesNotThrow(() -> consumer.consumirRegistrado(record));
        verify(notificarSinistroRegistradoUseCase).executar(any());
        org.junit.jupiter.api.Assertions.assertNull(org.slf4j.MDC.get("correlationId"));
    }

    @Test
    void deveConsumirRejeitadoComSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"motivoRejeicao\":\"Documento falso\"}",
                sinistroId, seguradoId
        );
        ConsumerRecord<String, String> record = new ConsumerRecord<>(
                "sinistro.rejeitado", 0, 0L, sinistroId.toString(), message
        );

        assertDoesNotThrow(() -> consumer.consumirRejeitado(record));
        verify(notificarSinistroRejeitadoUseCase).executar(any());
        org.junit.jupiter.api.Assertions.assertNull(org.slf4j.MDC.get("correlationId"));
    }

    @Test
    void deveConsumirLiquidacaoComSucesso_quandoStatusProcessado() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"valorLiquidado\":15000.00,\"status\":\"PROCESSADO\"}",
                sinistroId, seguradoId
        );
        ConsumerRecord<String, String> record = new ConsumerRecord<>(
                "pagamento.liquidado", 0, 0L, sinistroId.toString(), message
        );

        assertDoesNotThrow(() -> consumer.consumirLiquidacao(record));
        verify(notificarPagamentoLiquidadoUseCase).executar(any());
        org.junit.jupiter.api.Assertions.assertNull(org.slf4j.MDC.get("correlationId"));
    }

    @Test
    void deveConsumirDocumentoSolicitadoComSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"numeroSinistro\":\"SIN-123\",\"dataSolicitacao\":\"2026-10-16T18:00:00Z\"}",
                sinistroId, seguradoId
        );
        ConsumerRecord<String, String> record = new ConsumerRecord<>(
                "sinistro.documentos-solicitados", 0, 0L, sinistroId.toString(), message
        );

        assertDoesNotThrow(() -> consumer.consumirDocumentoSolicitado(record));
        verify(notificarDocumentoSolicitadoUseCase).executar(any());
        org.junit.jupiter.api.Assertions.assertNull(org.slf4j.MDC.get("correlationId"));
    }

    @Test
    void deveConsumirDocumentoRecebidoComSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String message = String.format(
                "{\"sinistroId\":\"%s\",\"seguradoId\":\"%s\",\"numeroSinistro\":\"SIN-123\",\"nomeArquivo\":\"bo.pdf\",\"tipoDocumento\":\"BOLETIM_OCORRENCIA\",\"dataUpload\":\"2026-10-16T18:00:00Z\"}",
                sinistroId, seguradoId
        );
        ConsumerRecord<String, String> record = new ConsumerRecord<>(
                "sinistro.documento-adicionado", 0, 0L, sinistroId.toString(), message
        );

        assertDoesNotThrow(() -> consumer.consumirDocumentoRecebido(record));
        verify(notificarDocumentoRecebidoUseCase).executar(any());
        org.junit.jupiter.api.Assertions.assertNull(org.slf4j.MDC.get("correlationId"));
    }
}
