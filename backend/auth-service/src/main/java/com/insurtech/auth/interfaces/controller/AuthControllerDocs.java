package com.insurtech.auth.interfaces.controller;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.LoginResponseDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.application.dto.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "Autenticação", description = "Endpoints para login de usuários e validação de tokens JWT")
public interface AuthControllerDocs {

    @Operation(summary = "Realizar login", description = "Valida as credenciais (e-mail/senha) de um usuário e retorna o token JWT caso autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso. Retorna as informações do usuário e o token JWT."),
        @ApiResponse(responseCode = "400", description = "Campos obrigatórios ausentes ou em formato inválido", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas (senha incorreta ou email não cadastrado)", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Usuário inativo ou sem permissão", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "E-mail de usuário não encontrado no sistema", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<LoginResponseDTO> login(LoginRequestDTO dto);

    @Operation(summary = "Validar token JWT", description = "Recebe um token Bearer JWT, valida a sua assinatura/expiração e retorna as informações do usuário associado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token válido. Retorna os dados do usuário correspondente."),
        @ApiResponse(responseCode = "401", description = "Token de autorização inválido, expirado ou ausente no cabeçalho", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Usuário associado ao token não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioResponseDTO> validarToken(
            @Parameter(description = "Token Bearer JWT enviado no cabeçalho Authorization", required = true) String authHeader);
}
