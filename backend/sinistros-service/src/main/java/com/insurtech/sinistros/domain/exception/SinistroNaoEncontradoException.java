package com.insurtech.sinistros.domain.exception;

public class SinistroNaoEncontradoException extends RuntimeException {
    public SinistroNaoEncontradoException(String message) {
        super(message);
    }
}
