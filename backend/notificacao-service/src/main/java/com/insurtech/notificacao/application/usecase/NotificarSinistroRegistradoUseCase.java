package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.application.dto.SinistroRegistradoEventDTO;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class NotificarSinistroRegistradoUseCase {

    public void executar(SinistroRegistradoEventDTO dto) {
        Notificacao notificacao = new Notificacao();
        notificacao.setId(UUID.randomUUID());
        notificacao.setSeguradoId(dto.seguradoId());
        notificacao.setTipo(TipoNotificacao.SINISTRO_REGISTRADO);
        notificacao.setTitulo("Sinistro registrado com sucesso");
        notificacao.setMensagem(String.format(
                "Seu sinistro %s foi registrado e está em análise.", dto.numeroSinistro()
        ));
        notificacao.setCriadoEm(Instant.now());
        notificacao.validar();

        // simula envio — em produção seria integração com e-mail/SMS/push
        log.info("[NOTIFICACAO] seguradoId={} | titulo={} | mensagem={}",
                notificacao.getSeguradoId(),
                notificacao.getTitulo(),
                notificacao.getMensagem());
    }
}
