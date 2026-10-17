package com.insurtech.liquidacao.application.usecase;

import com.insurtech.liquidacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.liquidacao.application.dto.SinistroAprovadoEventDTO;
import com.insurtech.liquidacao.application.port.EventPublisherPort;
import com.insurtech.liquidacao.domain.exception.PagamentoProcessadoException;
import com.insurtech.liquidacao.domain.model.EventoPagamento;
import com.insurtech.liquidacao.domain.model.Status;
import com.insurtech.liquidacao.domain.repository.EventoPagamentoRepository;
import com.insurtech.liquidacao.infrastructure.persistence.inbox.InboxEventJpaEntity;
import com.insurtech.liquidacao.infrastructure.persistence.inbox.InboxEventJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessarLiquidacaoUseCase {

    private final EventoPagamentoRepository repository;
    private final EventPublisherPort eventPublisher;
    private final InboxEventJpaRepository inboxRepository;

    @Transactional
    public void executar(SinistroAprovadoEventDTO dto, String messageId) {
        // 1. Verificação de Idempotência pelo Transactional Inbox
        if (inboxRepository.existsByMessageId(messageId)) {
            log.warn("[INBOX] Mensagem duplicada detectada! messageId={} já processado. Descartando.", messageId);
            return;
        }

        // 2. Registra o evento no Inbox atomicamente
        InboxEventJpaEntity inbox = new InboxEventJpaEntity();
        inbox.setId(UUID.randomUUID());
        inbox.setMessageId(messageId);
        inbox.setAggregateId(dto.sinistroId().toString());
        inbox.setTopic("sinistro.aprovado");
        inbox.setConsumerGroup("liquidacao-group");
        inbox.setProcessedAt(Instant.now());
        inboxRepository.save(inbox);


        EventoPagamento pagamento = new EventoPagamento();
        pagamento.setId(UUID.randomUUID());
        pagamento.setSinistroId(dto.sinistroId());
        pagamento.setValorLiquidado(dto.valorAprovado());
        pagamento.setStatus(Status.PENDENTE);
        pagamento.setEventoIdOrigem(messageId);
        pagamento.setCreatedAt(Instant.now());

        repository.salvar(pagamento);

        try {
            log.info("Processando liquidação financeira para sinistroId: {}", dto.sinistroId());

            pagamento.processar();
            repository.salvar(pagamento);

            eventPublisher.publicarPagamentoLiquidado(new PagamentoLiquidadoEventDTO(
                    dto.sinistroId(),
                    dto.seguradoId(),
                    pagamento.getValorLiquidado(),
                    "PROCESSADO"
            ));

            log.info("Liquidação processada com sucesso para sinistroId: {}", dto.sinistroId());

        } catch (PagamentoProcessadoException e) {
            log.warn("Tentativa de reprocessamento negada: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Falha ao processar liquidação para sinistroId: {}", dto.sinistroId(), e);
            pagamento.falhar();
            repository.salvar(pagamento);

            eventPublisher.publicarPagamentoLiquidado(new PagamentoLiquidadoEventDTO(
                    dto.sinistroId(),
                    dto.seguradoId(),
                    pagamento.getValorLiquidado(),
                    "FALHOU"
            ));
        }
    }
}