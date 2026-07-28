package com.insurtech.notificacao.domain.exception;

public class MensagemObrigatoriaException extends RuntimeException {
    public MensagemObrigatoriaException(String message) {
        super(message);
    }
}
