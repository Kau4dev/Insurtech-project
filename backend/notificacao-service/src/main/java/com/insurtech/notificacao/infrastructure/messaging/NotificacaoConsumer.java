package com.insurtech.notificacao.infrastructure.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurtech.notificacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.notificacao.application.dto.SinistroRegistradoEventDTO;
import com.insurtech.notificacao.application.dto.SinistroRejeitadoEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificacaoConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "sinistro.registrado")
    public void consumirRegistrado(String message) {
        try {
            SinistroRegistradoEventDTO event = objectMapper.readValue(message, SinistroRegistradoEventDTO.class);
            log.info("[NOTIFICAÇÃO] E-mail enviado para o Segurado (ID: {}). O sinistro número {} foi REGISTRADO com sucesso e já está em análise.", 
                    event.seguradoId(), event.numeroSinistro());
        } catch (JsonProcessingException e) {
            log.error("Erro ao desserializar evento SinistroRegistrado: {}", message, e);
        }
    }

    @KafkaListener(topics = "sinistro.rejeitado")
    public void consumirRejeitado(String message) {
        try {
            SinistroRejeitadoEventDTO event = objectMapper.readValue(message, SinistroRejeitadoEventDTO.class);
            log.info("[NOTIFICAÇÃO] E-mail enviado para o Segurado (ID: {}). O sinistro ID {} foi REJEITADO. Motivo da rejeição: {}", 
                    event.seguradoId(), event.sinistroId(), event.motivoRejeicao());
        } catch (JsonProcessingException e) {
            log.error("Erro ao desserializar evento SinistroRejeitado: {}", message, e);
        }
    }

    @KafkaListener(topics = "pagamento.liquidado")
    public void consumirLiquidacao(String message) {
        try {
            PagamentoLiquidadoEventDTO event = objectMapper.readValue(message, PagamentoLiquidadoEventDTO.class);
            if ("PROCESSADO".equals(event.status())) {
                log.info("[NOTIFICAÇÃO] E-mail enviado para o Segurado (ID: {}). O pagamento do seu sinistro ID {} no valor de R$ {} foi LIQUIDADO com sucesso.", 
                        event.seguradoId(), event.sinistroId(), event.valorLiquidado());
            } else {
                log.warn("[NOTIFICAÇÃO] SMS de alerta enviado para o Segurado (ID: {}). Houve uma falha no processamento do pagamento do sinistro ID {}. Entraremos em contato em breve.", 
                        event.seguradoId(), event.sinistroId());
            }
        } catch (JsonProcessingException e) {
            log.error("Erro ao desserializar evento PagamentoLiquidado: {}", message, e);
        }
    }
}
