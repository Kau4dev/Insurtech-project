package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.application.dto.SinistroRejeitadoEventDTO;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class NotificarSinistroRejeitadoUseCase {

    public void executar(SinistroRejeitadoEventDTO dto) {
        Notificacao notificacao = new Notificacao();
        notificacao.setId(UUID.randomUUID());
        notificacao.setSeguradoId(dto.seguradoId());
        notificacao.setTipo(TipoNotificacao.SINISTRO_REJEITADO);
        notificacao.setTitulo("Sinistro rejeitado");
        notificacao.setMensagem(String.format(
                "Seu sinistro foi rejeitado. Motivo: %s", dto.motivoRejeicao()
        ));
        notificacao.setCriadoEm(Instant.now());
        notificacao.validar();

        log.info("[NOTIFICACAO] seguradoId={} | titulo={} | mensagem={}",
                notificacao.getSeguradoId(),
                notificacao.getTitulo(),
                notificacao.getMensagem());
    }
}