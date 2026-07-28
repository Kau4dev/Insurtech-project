package com.insurtech.auth.domain.exception;

public class EmailObrigatorioException extends RuntimeException {
    public EmailObrigatorioException(String message) {
        super(message);
    }
}
