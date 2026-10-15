package com.insurtech.notificacao.infrastructure.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.notificacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.notificacao.application.dto.SinistroRegistradoEventDTO;
import com.insurtech.notificacao.application.dto.SinistroRejeitadoEventDTO;
import com.insurtech.notificacao.application.usecase.NotificarPagamentoLiquidadoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarSinistroRegistradoUseCase;
import com.insurtech.notificacao.application.usecase.NotificarSinistroRejeitadoUseCase;
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
    private final NotificarSinistroRegistradoUseCase notificarSinistroRegistradoUseCase;
    private final NotificarSinistroRejeitadoUseCase notificarSinistroRejeitadoUseCase;
    private final NotificarPagamentoLiquidadoUseCase notificarPagamentoLiquidadoUseCase;

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "sinistro.registrado")
    public void consumirRegistrado(String message) throws JsonProcessingException {
        SinistroRegistradoEventDTO event = objectMapper.readValue(message, SinistroRegistradoEventDTO.class);
        log.info("[KAFKA] Consumindo sinistro.registrado para seguradoId={}", event.seguradoId());
        notificarSinistroRegistradoUseCase.executar(event);
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "sinistro.rejeitado")
    public void consumirRejeitado(String message) throws JsonProcessingException {
        SinistroRejeitadoEventDTO event = objectMapper.readValue(message, SinistroRejeitadoEventDTO.class);
        log.info("[KAFKA] Consumindo sinistro.rejeitado para seguradoId={}", event.seguradoId());
        notificarSinistroRejeitadoUseCase.executar(event);
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            autoCreateTopics = "true"
    )
    @KafkaListener(topics = "pagamento.liquidado")
    public void consumirLiquidacao(String message) throws JsonProcessingException {
        PagamentoLiquidadoEventDTO event = objectMapper.readValue(message, PagamentoLiquidadoEventDTO.class);
        log.info("[KAFKA] Consumindo pagamento.liquidado para seguradoId={}", event.seguradoId());
        notificarPagamentoLiquidadoUseCase.executar(event);
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
