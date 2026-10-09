package com.insurtech.auth.interfaces.controller;

import com.insurtech.auth.application.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários (administração e consulta)")
public interface UsuarioControllerDocs {

    @Operation(summary = "Cadastrar usuário", description = "Cadastra um novo usuário no sistema. Apenas usuários com papel ADMIN ou GESTOR podem realizar o cadastro.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário cadastrado com sucesso. Retorna as informações do usuário criado."),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios ausentes ou em formato inválido",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acesso negado. Apenas administradores e gestores podem cadastrar usuários",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-mail já cadastrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioCriadoResponseDTO> cadastrarUsuario(CadastrarUsuarioRequestDTO dto);

    @Operation(summary = "Buscar usuário por ID", description = "Retorna os dados de um usuário a partir do seu ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado. Retorna os dados do usuário correspondente."),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioResponseDTO> buscarUsuarioPorId(
            @Parameter(description = "ID do usuário (UUID)", required = true) UUID id);

    @Operation(summary = "Listar todos os usuários", description = "Retorna a listagem de todos os usuários cadastrados no sistema, com opção de filtro por status ativo/inativo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuários retornada com sucesso."),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios(
            @Parameter(description = "Filtro opcional por status ativo (true ou false)", required = false) Boolean ativo
    );

    @Operation(summary = "Atualizar usuário (ativar)", description = "Ativa um usuário que estava inativo no sistema.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário ativado com sucesso."),
            @ApiResponse(responseCode = "400", description = "Usuário já está ativo ou requisição inválida",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acesso negado. Apenas administradores e gestores podem ativar usuários",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioResponseDTO> atualizarUsuario(
            @Parameter(description = "ID do usuário (UUID)", required = true) UUID id
    );

    @Operation(summary = "Deletar usuário (inativar)", description = "Inativa um usuário do sistema (soft delete).")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Usuário inativado com sucesso."),
            @ApiResponse(responseCode = "400", description = "Usuário já está inativo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acesso negado. Apenas administradores e gestores podem inativar usuários",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> deletarUsuario(
            @Parameter(description = "ID do usuário (UUID)", required = true) UUID id
    );
}