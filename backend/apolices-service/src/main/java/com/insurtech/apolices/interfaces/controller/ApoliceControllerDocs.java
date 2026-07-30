package com.insurtech.apolices.interfaces.controller;

import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.AtualizarStatusApoliceDTO;
import com.insurtech.apolices.application.dto.PageResponseDTO;
import com.insurtech.apolices.application.dto.ErrorResponse;
import com.insurtech.apolices.domain.exception.StatusNaoSuportadoException;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
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

@Tag(name = "Apólices", description = "Gerenciamento de apólices de seguro")
public interface ApoliceControllerDocs {

    @Operation(summary = "Cadastrar apólice", description = "Cria uma nova apólice de seguro associada a um segurado cadastrado.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Apólice cadastrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos (ex: franquia excede cobertura, valor inválido, tipo de cobertura incompatível)", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Segurado associado não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Apólice com número ou dados conflitantes já cadastrada", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ApoliceResponseDTO> cadastrarApolice(ApoliceRequestDTO dto);

    @Operation(summary = "Buscar apólice por ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Apólice encontrada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Apólice não encontrada para o ID fornecido", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ApoliceResponseDTO> buscarPorId(
            @Parameter(description = "ID único da apólice (UUID)", required = true) UUID id);

    @Operation(summary = "Listar apólices", description = "Retorna uma lista paginada de apólices, com a opção de filtrar por segurado, status ou tipo de seguro.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Parâmetros de ordenação ou filtros inválidos", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<PageResponseDTO<ApoliceResponseDTO>> listarApolices(
            @Parameter(description = "ID do segurado para filtrar as apólices") UUID idSegurado,
            @Parameter(description = "Status atual da apólice") Status status,
            @Parameter(description = "Tipo do seguro") TipoSeguro tipoSeguro,
            Pageable pageable);

    @Operation(summary = "Atualizar status da apólice", description = "Altera o status de vigência da apólice (ex: ATIVA, INATIVA, CANCELADA).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Status inválido ou transição de status não suportada", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Apólice não encontrada", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ApoliceResponseDTO> atualizarStatus(
            @Parameter(description = "ID da apólice (UUID)", required = true) UUID id,
            AtualizarStatusApoliceDTO dto) throws StatusNaoSuportadoException;
}
