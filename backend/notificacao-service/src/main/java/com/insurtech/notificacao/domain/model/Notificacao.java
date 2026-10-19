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
    private boolean lida = false;
    private boolean lidaSegurado = false;
    private boolean lidaInterno = false;
    private Instant criadoEm;

    public void setLida(boolean lida) {
        this.lida = lida;
        if (lida) {
            this.lidaSegurado = true;
            this.lidaInterno = true;
        } else {
            this.lidaSegurado = false;
            this.lidaInterno = false;
        }
    }

    public void marcarComoLidaSegurado() {
        this.lidaSegurado = true;
        this.lida = true;
    }

    public void marcarComoLidaInterno() {
        this.lidaInterno = true;
    }

    public void marcarComoLida(String papel) {
        if ("SEGURADO".equalsIgnoreCase(papel)) {
            marcarComoLidaSegurado();
        } else {
            marcarComoLidaInterno();
        }
    }

    public void marcarComoLida() {
        this.lida = true;
        this.lidaSegurado = true;
        this.lidaInterno = true;
    }

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