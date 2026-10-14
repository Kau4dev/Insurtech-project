package com.insurtech.segurados.interfaces.exception;

import com.insurtech.segurados.application.dto.ErrorResponse;
import com.insurtech.segurados.domain.exception.*;
import feign.FeignException;
import feign.RetryableException;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNaoAutenticadoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioNaoAutenticado(UsuarioNaoAutenticadoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request, null));
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErrorResponse> handleAcessoNegado(AcessoNegadoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, ex.getMessage(), request, null));
    }

    @ExceptionHandler(UsuarioJaCadastradoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioJaCadastrado(UsuarioJaCadastradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request, null));
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioNaoEncontrado(UsuarioNaoEncontradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request, null));
    }

    @ExceptionHandler(UsuarioInvalidoParaSeguradoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioInvalidoParaSegurado(UsuarioInvalidoParaSeguradoException ex, ServletWebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null));
    }

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

    @ExceptionHandler(RetryableException.class)
    public ResponseEntity<ErrorResponse> handleFeignRetryable(
            RetryableException ex,
            ServletWebRequest request) {
        log.error("auth-service inacessível em {}: {}", request.getRequest().getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(buildError(HttpStatus.SERVICE_UNAVAILABLE, "Serviço de autenticação (auth-service) indisponível. Verifique se o serviço está ativo na porta 8084.", request, null));
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorResponse> handleFeignException(
            FeignException ex,
            ServletWebRequest request) {
        log.error("Erro ao comunicar com auth-service via Feign [status {}] em {}: {}", ex.status(), request.getRequest().getRequestURI(), ex.getMessage());
        if (ex.status() == 409) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(buildError(HttpStatus.CONFLICT, "E-mail já cadastrado no sistema de autenticação.", request, null));
        }
        if (ex.status() == 403) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(buildError(HttpStatus.FORBIDDEN, "Acesso negado no serviço de autenticação.", request, null));
        }
        HttpStatus status = HttpStatus.resolve(ex.status());
        if (status == null) status = HttpStatus.BAD_GATEWAY;
        return ResponseEntity.status(status)
                .body(buildError(status, "Erro na integração com auth-service: " + ex.getMessage(), request, null));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex,
            ServletWebRequest request) {
        log.error("IllegalStateException em {}: {}", request.getRequest().getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(buildError(HttpStatus.BAD_GATEWAY, ex.getMessage(), request, null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenerico(
            Exception ex,
            ServletWebRequest request) {
        log.error("Erro interno inesperado em {}: {}", request.getRequest().getRequestURI(), ex.getMessage(), ex);
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

