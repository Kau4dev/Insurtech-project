package com.insurtech.sinistros.interfaces.controller;

import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.request.AprovarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.request.RejeitarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.*;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.RequestHeader;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "Sinistros", description = "Gerenciamento do ciclo de vida de sinistros (abertura, análise, anexação de documentos e fechamento)")
public interface SinistroControllerDocs {

    @Operation(summary = "Registrar abertura de sinistro", description = "Abre um novo processo de sinistro associado a uma apólice ativa.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Sinistro registrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos (datas incoerentes ou campos obrigatórios ausentes)", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Apólice ou segurado informado não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Conflito: Sinistro já cadastrado para esta apólice com o mesmo evento", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SinistroResponseDTO> registrarSinistro(SinistroRequestDTO dto);

    @Operation(summary = "Listar sinistros", description = "Lista os sinistros cadastrados de forma paginada e filtrada por diversos parâmetros.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Campo de ordenação ou formato de data inválido", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<PageResponseDTO<SinistroResponseDTO>> listarSinistros(
            @Parameter(description = "Filtrar por ID da apólice") UUID apoliceId,
            @Parameter(description = "Filtrar por ID do segurado") UUID seguradoId,
            @Parameter(description = "Filtrar por ID do analista") UUID analistaId,
            @Parameter(description = "Filtrar por status do sinistro") Status status,
            @Parameter(description = "Filtrar por tipo do sinistro") TipoSinistro tipoSinistro,
            @Parameter(description = "Data inicial para filtro do período de ocorrência") LocalDate dataInicio,
            @Parameter(description = "Data final para filtro do período de ocorrência") LocalDate dataFim,
            Pageable pageable);

    @Operation(summary = "Buscar sinistro por ID", description = "Retorna detalhes completos do sinistro, incluindo a lista de documentos anexados.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sinistro encontrado"),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado para o ID fornecido", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SinistroDetalhadoResponseDTO> buscarPorId(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id);

    @Operation(summary = "Atribuir analista ao sinistro", description = "Atribui um analista responsável para iniciar a análise técnica do sinistro. Apenas usuários com papel GESTOR ou ADMIN podem realizar essa atribuição.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Analista atribuído com sucesso"),
        @ApiResponse(responseCode = "400", description = "Validação de domínio violada (ex: analista obrigatório, status inválido para atribuição)", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Não autorizado - Usuário não autenticado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acesso proibido - Apenas gestores ou administradores podem atribuir analistas", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SinistroResponseDTO> atribuirAnalista(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id,
            @Parameter(description = "ID do analista (UUID)", required = true) UUID analistaId,
            @RequestHeader(value = "X-Usuario-Id", required = false) String usuarioId,
            @RequestHeader(value = "X-Usuario-Papel", required = false) String usuarioPapel);

    @Operation(summary = "Alterar status para aguardar documentos", description = "Atualiza o status do sinistro sinalizando que há pendência de documentos complementares por parte do segurado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status atualizado para aguardando documentos"),
        @ApiResponse(responseCode = "400", description = "Transição de status inválida", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SinistroResponseDTO> aguardarDocumentos(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id);

    @Operation(summary = "Aprovar sinistro", description = "Aprova o sinistro após análise técnica favorável, liberando o processo de indenização.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sinistro aprovado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados de aprovação inválidos ou transição de status proibida", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SinistroResponseDTO> aprovar(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id,
            AprovarSinistroRequestDTO dto);

    @Operation(summary = "Rejeitar sinistro", description = "Rejeita a solicitação de sinistro e exige a justificativa técnica (motivo da rejeição).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sinistro rejeitado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Motivo de rejeição obrigatório ou transição de status inválida", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<SinistroResponseDTO> rejeitar(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id,
            RejeitarSinistroRequestDTO dto);

    @Operation(summary = "Adicionar documento complementar", description = "Permite anexar documentos ao sinistro.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Documento anexado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados do documento inválidos (url vazia, tipo ausente)", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<DocumentoSinistroResponseDTO> adicionarDocumento(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id,
            AdicionarDocumentoRequestDTO dto);

    @Operation(summary = "Visualizar histórico de status", description = "Retorna toda a trilha de auditoria e transições de status pelas quais o sinistro passou.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Sinistro não encontrado", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<HistoricoSinistroResponseDTO>> mostrarHistorico(
            @Parameter(description = "ID do sinistro (UUID)", required = true) UUID id);

    @Operation(summary = "Obter dashboard de métricas", description = "Retorna um resumo quantitativo consolidado de sinistros.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Métricas geradas com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor", 
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<DashboardResponseDTO> mostrarMetricas();
}
