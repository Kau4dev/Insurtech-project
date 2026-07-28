package com.insurtech.sinistros.infrastructure.messaging;

import com.insurtech.sinistros.domain.event.PagamentoLiquidadoEvent;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PagamentoLiquidadoConsumer {

    private final SinistroRepository repository;

    @KafkaListener(
            topics = "pagamento.liquidado",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumir(ConsumerRecord<String, PagamentoLiquidadoEvent> record) {
        PagamentoLiquidadoEvent event = record.value();
        log.info("Evento PagamentoLiquidado recebido no sinistros-service para sinistroId={}", event.sinistroId());

        if ("PROCESSADO".equals(event.status())) {
            repository.buscarPorId(event.sinistroId()).ifPresentOrElse(
                    sinistro -> {
                        sinistro.marcarComoPago();
                        repository.salvar(sinistro);
                        log.info("Status do sinistro {} atualizado com sucesso para PAGO.", sinistro.getId());
                    },
                    () -> log.error("Sinistro não encontrado para o ID: {}", event.sinistroId())
            );
        } else {
            log.warn("Pagamento falhou para o sinistro ID: {}. Nenhuma ação de status executada.", event.sinistroId());
        }
    }
}