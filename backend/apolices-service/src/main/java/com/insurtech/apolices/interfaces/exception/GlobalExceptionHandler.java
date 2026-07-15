package com.insurtech.apolices.interfaces.exception;

import com.insurtech.apolices.application.dto.ErrorResponse;
import com.insurtech.apolices.domain.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SeguradoNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleSeguradoNaoEncontrado(SeguradoNaoEncontradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request, null));

    }

    @ExceptionHandler(ApoliceNaoEncontradaException.class)
    public ResponseEntity<ErrorResponse> handleApoliceNaoEncontrada(ApoliceNaoEncontradaException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request, null));

    }

    @ExceptionHandler(StatusNaoSuportadoException.class)
    public ResponseEntity<ErrorResponse> handleStatusNaoSuportado(StatusNaoSuportadoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null));
    }

    @ExceptionHandler(StatusApoliceInvalidoException.class)
    public ResponseEntity<ErrorResponse> handleStatusApoliceInvalido(StatusApoliceInvalidoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null));
    }

    @ExceptionHandler(CoberturaInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleCoberturaInvalida(CoberturaInvalidaException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null));
    }
    @ExceptionHandler(FranquiaExcedeCoberturaException.class)
    public ResponseEntity<ErrorResponse> handleFranquiaExcedeCobertura(FranquiaExcedeCoberturaException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null));
    }

    private ErrorResponse buildError(HttpStatus status,
                                     String message,
                                     ServletWebRequest request,
                                     Map<String, String> errors) {
        return new ErrorResponse(
                status.value(),
                message,
                request.getRequest().getRequestURI(),
                errors,
                LocalDateTime.now()
        );
    }
}
