package com.insurtech.notificacao.domain.model;

import com.insurtech.notificacao.domain.exception.SeguradoObrigatorioException;
import com.insurtech.notificacao.domain.exception.TituloObrigatorioException;
import com.insurtech.notificacao.domain.exception.MensagemObrigatoriaException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Notificacao {

    private UUID id;
    private UUID seguradoId;
    private String titulo;
    private String mensagem;
    private TipoNotificacao tipo;
    private Instant criadoEm;

    public void validar() {
        if (seguradoId == null) {
            throw new SeguradoObrigatorioException("SeguradoId é obrigatório");
        }
        if (titulo == null || titulo.isBlank()) {
            throw new TituloObrigatorioException("Título é obrigatório");
        }
        if (mensagem == null || mensagem.isBlank()) {
            throw new MensagemObrigatoriaException("Mensagem é obrigatória");
        }
    }
}