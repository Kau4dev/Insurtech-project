package com.insurtech.segurados.interfaces.controller;

import com.insurtech.segurados.application.dto.PageResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.application.dto.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

@Tag(name = "Segurados", description = "Gerenciamento de segurados (Pessoas Físicas e Jurídicas)")
public interface SeguradoControllerDocs {

    @Operation(summary = "Cadastrar segurado", description = "Cadastra um novo segurado validando CPF/CNPJ duplicados e campos obrigatórios para PF/PJ.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Segurado cadastrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos (ex: UF inválida, data de nascimento obrigatória para PF, atributo inválido para PJ)", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "CPF/CNPJ já cadastrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SeguradoResponseDTO> cadastrarSegurado(SeguradoRequestDTO dto);

    @Operation(summary = "Buscar segurado por ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Segurado encontrado"),
        @ApiResponse(responseCode = "404", description = "Segurado não encontrado para o ID fornecido", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SeguradoResponseDTO> buscarPorId(
            @Parameter(description = "ID do segurado", required = true) UUID id);

    @Operation(summary = "Listar segurados", description = "Listagem paginada com filtro por nome.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Campo de ordenação inválido", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<PageResponseDTO<SeguradoResponseDTO>> listarSegurados(
            @Parameter(description = "Nome para filtrar") String nome,
            Pageable pageable);

    @Operation(summary = "Atualizar segurado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Segurado atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Segurado não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SeguradoResponseDTO> atualizarSegurado(
            @Parameter(description = "ID do segurado", required = true) UUID id,
            SeguradoUpdateDTO dto);
}
