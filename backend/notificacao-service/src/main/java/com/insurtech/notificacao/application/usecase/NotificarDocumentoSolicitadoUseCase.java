package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.application.dto.SinistroDocumentoSolicitadoEventDTO;
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
public class NotificarDocumentoSolicitadoUseCase {

    private final NotificacaoRepository repository;

    public void executar(SinistroDocumentoSolicitadoEventDTO dto) {
        Notificacao notificacao = new Notificacao();
        notificacao.setId(UUID.randomUUID());
        notificacao.setSeguradoId(dto.seguradoId());
        notificacao.setTipo(TipoNotificacao.DOCUMENTO_SOLICITADO);
        notificacao.setTitulo("Documentação solicitada para o sinistro #" + dto.numeroSinistro());
        notificacao.setMensagem(
                "O analista solicitou documentos complementares. Acesse o portal para realizar o envio."
        );
        notificacao.setCriadoEm(Instant.now());
        notificacao.validar();

        repository.salvar(notificacao);

        log.info("[NOTIFICACAO SALVA] id={} | seguradoId={} | titulo={}",
                notificacao.getId(),
                notificacao.getSeguradoId(),
                notificacao.getTitulo());
    }
}

