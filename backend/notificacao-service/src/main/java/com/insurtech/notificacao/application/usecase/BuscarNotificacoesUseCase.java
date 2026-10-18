package com.insurtech.notificacao.application.usecase;

import com.insurtech.notificacao.application.dto.NotificacaoResponseDTO;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BuscarNotificacoesUseCase {

    private final NotificacaoRepository repository;

    public List<NotificacaoResponseDTO> executar(UUID seguradoId, Boolean apenasNaoLidas) {
        List<Notificacao> notificacoes;
        if (seguradoId != null) {
            notificacoes = repository.listarPorSeguradoId(seguradoId, apenasNaoLidas);
        } else {
            notificacoes = repository.listarTodas(apenasNaoLidas);
        }

        return notificacoes.stream()
                .map(this::toDTO)
                .toList();
    }

    private NotificacaoResponseDTO toDTO(Notificacao n) {
        return new NotificacaoResponseDTO(
                n.getId(),
                n.getSeguradoId(),
                n.getTitulo(),
                n.getMensagem(),
                n.getTipo(),
                n.isLida(),
                n.getCriadoEm()
        );
    }
}

