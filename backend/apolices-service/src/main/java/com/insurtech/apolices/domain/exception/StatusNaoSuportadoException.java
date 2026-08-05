package com.insurtech.apolices.domain.exception;

public class StatusNaoSuportadoException extends RuntimeException {
    public StatusNaoSuportadoException(String message) {
        super(message);
    }
}
