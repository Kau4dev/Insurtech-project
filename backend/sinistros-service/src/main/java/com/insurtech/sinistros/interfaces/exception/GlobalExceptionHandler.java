package com.insurtech.sinistros.interfaces.exception;

import com.insurtech.sinistros.application.dto.response.ErrorResponse;
import com.insurtech.sinistros.domain.exception.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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

    @ExceptionHandler(SinistroNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleSinistroNaoEncontrado(SinistroNaoEncontradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request, null));
    }

    @ExceptionHandler(SinistrojaCadastradaException.class)
    public ResponseEntity<ErrorResponse> handleSinistroJaCadastrado(SinistrojaCadastradaException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request, null));
    }

    @ExceptionHandler({
            MotivoRejeicaoObrigatorioException.class,
            NomeArquivoObrigatorioException.class,
            SinistroObrigatorioException.class,
            AnalistaObrigatorioException.class,
            StatusInvalidoException.class,
            StatusNovoObrigatorioException.class,
            TipoDocumentoObrigatorioException.class,
            UrlArquivoObrigatoria.class,
            DocumentoObrigatorioException.class,
            ValorInvalidoException.class,
            IllegalArgumentException.class,
            IllegalStateException.class
    })
    public ResponseEntity<ErrorResponse> handleDomainValidations(Exception ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidacao(
            MethodArgumentNotValidException ex,
            ServletWebRequest request) {

        Map<String, String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing
                ));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "Erro de validação", request, errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenerico(
            Exception ex,
            ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno: " + ex.getMessage(), request, null));
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

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, "Erro de integridade de dados: " + ex.getMostSpecificCause().getMessage(), request, null));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido ou mal formatado", request, null));
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
