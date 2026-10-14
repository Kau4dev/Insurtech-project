package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.application.dto.SinistroRegistradoEventDTO;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificarSinistroRegistradoUseCase {

    private final NotificacaoRepository repository;

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

        repository.salvar(notificacao);

        log.info("[NOTIFICACAO SALVA] id={} | seguradoId={} | titulo={}",
                notificacao.getId(),
                notificacao.getSeguradoId(),
                notificacao.getTitulo());
    }
}
