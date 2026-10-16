package com.insurtech.notificacao.infrastructure.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.notificacao.application.dto.*;
import com.insurtech.notificacao.application.usecase.*;
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
public class NotificacaoConsumer {

    private final ObjectMapper objectMapper;
    private final NotificarSinistroRegistradoUseCase notificarSinistroRegistrado;
    private final NotificarSinistroRejeitadoUseCase notificarSinistroRejeitado;
    private final NotificarDocumentoSolicitadoUseCase notificarDocumentoSolicitado;
    private final NotificarDocumentoRecebidoUseCase notificarDocumentoRecebido;
    private final NotificarPagamentoLiquidadoUseCase notificarPagamentoLiquidado;

    private void injetarCorrelationId(ConsumerRecord<?, ?> record) {
        org.apache.kafka.common.header.Header header = record.headers().lastHeader("X-Correlation-Id");
        String correlationId = (header != null)
                ? new String(header.value(), java.nio.charset.StandardCharsets.UTF_8)
                : java.util.UUID.randomUUID().toString();
        org.slf4j.MDC.put("correlationId", correlationId);
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "sinistro.registrado")
    public void consumirRegistrado(ConsumerRecord<String, String> record) throws JsonProcessingException {
        injetarCorrelationId(record);
        try {
            SinistroRegistradoEventDTO event = objectMapper.readValue(record.value(), SinistroRegistradoEventDTO.class);
            log.info("[KAFKA] Consumindo sinistro.registrado para seguradoId={}", event.seguradoId());
            notificarSinistroRegistrado.executar(event);
        } finally {
            org.slf4j.MDC.clear();
        }
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "sinistro.rejeitado")
    public void consumirRejeitado(ConsumerRecord<String, String> record) throws JsonProcessingException {
        injetarCorrelationId(record);
        try {
            SinistroRejeitadoEventDTO event = objectMapper.readValue(record.value(), SinistroRejeitadoEventDTO.class);
            log.info("[KAFKA] Consumindo sinistro.rejeitado para seguradoId={}", event.seguradoId());
            notificarSinistroRejeitado.executar(event);
        } finally {
            org.slf4j.MDC.clear();
        }
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "sinistro.documentos-solicitados")
    public void consumirDocumentoSolicitado(ConsumerRecord<String, String> record) throws JsonProcessingException {
        injetarCorrelationId(record);
        try {
            SinistroDocumentoSolicitadoEventDTO event = objectMapper.readValue(record.value(), SinistroDocumentoSolicitadoEventDTO.class);
            notificarDocumentoSolicitado.executar(event);
        } finally {
            org.slf4j.MDC.clear();
        }
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "sinistro.documento-adicionado")
    public void consumirDocumentoRecebido(ConsumerRecord<String, String> record) throws JsonProcessingException {
        injetarCorrelationId(record);
        try {
            SinistroDocumentoAdicionadoEventDTO event = objectMapper.readValue(record.value(), SinistroDocumentoAdicionadoEventDTO.class);
            notificarDocumentoRecebido.executar(event);
        } finally {
            org.slf4j.MDC.clear();
        }
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "pagamento.liquidado")
    public void consumirLiquidacao(ConsumerRecord<String, String> record) throws JsonProcessingException {
        injetarCorrelationId(record);
        try {
            PagamentoLiquidadoEventDTO event = objectMapper.readValue(record.value(), PagamentoLiquidadoEventDTO.class);
            log.info("[KAFKA] Consumindo pagamento.liquidado para seguradoId={}", event.seguradoId());
            notificarPagamentoLiquidado.executar(event);
        } finally {
            org.slf4j.MDC.clear();
        }
    }

    @DltHandler
    public void processarMensagemDlt(
            ConsumerRecord<String, String> record,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.EXCEPTION_MESSAGE) String erro
    ) {
        log.error("[DEAD LETTER TOPIC - DLT] Mensagem falhou após todas as tentativas. Topico: {} | Erro: {} | Payload: {}",
                topic, erro, record.value());
    }



}
