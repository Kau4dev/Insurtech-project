package com.insurtech.liquidacao.application.usecase;

import com.insurtech.liquidacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.liquidacao.application.dto.SinistroAprovadoEventDTO;
import com.insurtech.liquidacao.application.port.EventPublisherPort;
import com.insurtech.liquidacao.domain.model.EventoPagamento;
import com.insurtech.liquidacao.domain.model.Status;
import com.insurtech.liquidacao.domain.repository.EventoPagamentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessarLiquidacaoUseCase {

    private final EventoPagamentoRepository repository;
    private final EventPublisherPort eventPublisher;

    public void executar(SinistroAprovadoEventDTO dto, String eventoIdOrigem) {

        if (repository.existePorEventoIdOrigem(eventoIdOrigem)) {
            log.warn("Evento já processado, ignorando: {}", eventoIdOrigem);
            return;
        }

        EventoPagamento pagamento = new EventoPagamento();
        pagamento.setId(UUID.randomUUID());
        pagamento.setSinistroId(dto.sinistroId());
        pagamento.setValorLiquidado(dto.valorAprovado());
        pagamento.setStatus(Status.PENDENTE);
        pagamento.setEventoIdOrigem(eventoIdOrigem);
        pagamento.setCreatedAt(Instant.now());

        repository.salvar(pagamento);

        try {
            log.info("Processando liquidação para sinistroId: {}", dto.sinistroId());
            Thread.sleep(2000); // simula integração com sistema de pagamento

            pagamento.processar();
            repository.salvar(pagamento);

            eventPublisher.publicarPagamentoLiquidado(new PagamentoLiquidadoEventDTO(
                    dto.sinistroId(),
                    dto.seguradoId(),
                    pagamento.getValorLiquidado(),
                    "PROCESSADO"
            ));

            log.info("Liquidação processada com sucesso para sinistroId: {}", dto.sinistroId());

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