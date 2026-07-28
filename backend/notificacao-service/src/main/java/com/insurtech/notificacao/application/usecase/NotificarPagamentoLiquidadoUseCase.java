package com.insurtech.notificacao.application.usecase;


import com.insurtech.notificacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class NotificarPagamentoLiquidadoUseCase {

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

        log.info("[NOTIFICACAO] seguradoId={} | titulo={} | mensagem={}",
                notificacao.getSeguradoId(),
                notificacao.getTitulo(),
                notificacao.getMensagem());
    }
}
