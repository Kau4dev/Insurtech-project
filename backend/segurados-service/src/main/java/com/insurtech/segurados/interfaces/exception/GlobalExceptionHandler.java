package com.insurtech.segurados.interfaces.exception;

import com.insurtech.segurados.domain.exception.CpfCnpjJaCadastradoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;

import java.time.LocalDateTime;
import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(CpfCnpjJaCadastradoException.class)
    public ResponseEntity<ErrorResponse> handleCpfCnpjJaCadastrado(CpfCnpjJaCadastradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request, null));
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

    public record ErrorResponse(
            int status,
            String message,
            String path,
            Map<String, String> errors,
            LocalDateTime timestamp
    ) {
    }
}
