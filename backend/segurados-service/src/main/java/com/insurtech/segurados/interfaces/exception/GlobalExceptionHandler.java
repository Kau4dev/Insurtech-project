package com.insurtech.segurados.interfaces.exception;

import com.insurtech.segurados.application.dto.ErrorResponse;
import com.insurtech.segurados.domain.exception.CpfCnpjJaCadastradoException;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;


@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(CpfCnpjJaCadastradoException.class)
    public ResponseEntity<ErrorResponse> handleCpfCnpjJaCadastrado(CpfCnpjJaCadastradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request, null));
    }

    @ExceptionHandler(SeguradoNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleSeguradoNaoEncontrado(SeguradoNaoEncontradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request, null));

    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidacao(
            MethodArgumentNotValidException ex,
            ServletWebRequest request) {

        Map<String, String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage
                ));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "Erro de validação", request, errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenerico(
            Exception ex,
            ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno", request, null));
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

