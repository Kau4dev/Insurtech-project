package com.insurtech.segurados.interfaces.exception;

import com.insurtech.segurados.application.dto.ErrorResponse;
import com.insurtech.segurados.domain.exception.*;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
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

    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<ErrorResponse> handleSortInvalido(
            PropertyReferenceException ex,
            ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(
                        HttpStatus.BAD_REQUEST,
                        "Campo de ordenação inválido: " + ex.getPropertyName(),
                        request,
                        null
                ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, ServletWebRequest request) {

        String message = "Erro ao processar o JSON";
        Map<String, String> errors = new HashMap<>();
        Throwable cause = ex.getCause();

        if (cause != null && (cause instanceof UfInvalidaException || cause.getCause() instanceof UfInvalidaException)) {
            Throwable ufEx = (cause instanceof UfInvalidaException) ? cause : cause.getCause();

            message = "Erro de validação";

            errors.put("enderecoUf", ufEx.getMessage());
        } else if (cause != null) {
            errors.put("payload", "O JSON enviado possui erros de sintaxe ou formato.");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, message, request, errors));
    }

    @ExceptionHandler(UfInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleUfInvalidaException(
            UfInvalidaException ex, ServletWebRequest request) {
        Map<String, String> errors = new HashMap<>();
        errors.put("enderecoUf", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "UF inválida", request, errors));
    }

    @ExceptionHandler(AtributoInvalidoPessoaJuridicaException.class)
    public ResponseEntity<ErrorResponse> handleAtributoInvalidoPessoaJuridica(
            AtributoInvalidoPessoaJuridicaException ex, ServletWebRequest request) {
        Map<String, String> errors = new HashMap<>();
        errors.put("atributo", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "Atributo inválido para pessoa jurídica", request, errors));
    }

    @ExceptionHandler(DataNascimentoObrigatoriaException.class)
    public ResponseEntity<ErrorResponse> handleDataNascimentoObrigatoria(
            DataNascimentoObrigatoriaException ex, ServletWebRequest request) {
        Map<String, String> errors = new HashMap<>();
        errors.put("dataNascimento", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "Data de nascimento é obrigatória para pessoa física", request, errors));
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

