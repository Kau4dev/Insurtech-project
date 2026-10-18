package com.insurtech.notificacao.application.usecase;


import com.insurtech.notificacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class NotificarPagamentoLiquidadoUseCase {

    private final NotificacaoRepository repository;

    public void executar(PagamentoLiquidadoEventDTO dto) {
        Notificacao notificacao = new Notificacao();
        notificacao.setId(UUID.randomUUID());
        notificacao.setSeguradoId(dto.seguradoId());
        notificacao.setTipo(TipoNotificacao.PAGAMENTO_LIQUIDADO);

        if ("PROCESSADO".equals(dto.status())) {
            notificacao.setTitulo("Pagamento realizado");
            notificacao.setMensagem(String.format(
                    "O pagamento do seu sinistro no valor de R$ %s foi realizado com sucesso.",
                    dto.valorLiquidado()
            ));
        } else {
            notificacao.setTitulo("Falha no pagamento");
            notificacao.setMensagem(
                    "Houve uma falha ao processar o pagamento do seu sinistro. " +
                            "Nossa equipe entrará em contato."
            );
        }

        notificacao.setCriadoEm(Instant.now());
        notificacao.validar();

        repository.salvar(notificacao);

        log.info("[NOTIFICACAO SALVA] id={} | seguradoId={} | titulo={}",
                notificacao.getId(),
                notificacao.getSeguradoId(),
                notificacao.getTitulo());
    }
}
