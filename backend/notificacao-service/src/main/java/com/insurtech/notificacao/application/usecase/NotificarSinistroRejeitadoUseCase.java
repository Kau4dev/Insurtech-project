package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.application.dto.SinistroRejeitadoEventDTO;
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
public class NotificarSinistroRejeitadoUseCase {

    private final NotificacaoRepository repository;

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

        repository.salvar(notificacao);

        log.info("[NOTIFICACAO SALVA] id={} | seguradoId={} | titulo={}",
                notificacao.getId(),
                notificacao.getSeguradoId(),
                notificacao.getTitulo());
    }
}