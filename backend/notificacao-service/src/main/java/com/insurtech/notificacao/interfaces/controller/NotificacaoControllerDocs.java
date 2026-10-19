package com.insurtech.notificacao.interfaces.controller;

import com.insurtech.notificacao.application.dto.NotificacaoResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

@Tag(name = "Notificações", description = "Gerenciamento e consulta de notificações de eventos para segurados")
public interface NotificacaoControllerDocs {

    @Operation(summary = "Listar notificações", description = "Recupera o histórico de notificações emitidas, com filtros opcionais por segurado e status de leitura.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notificações recuperadas com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado: segurado tentando consultar notificações de outro usuário"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    ResponseEntity<List<NotificacaoResponseDTO>> listarNotificacoes(
            @Parameter(description = "Identificador do segurado para filtro") UUID seguradoId,
            @Parameter(description = "Filtrar apenas notificações pendentes de leitura") Boolean apenasNaoLidas
    );

    @Operation(summary = "Marcar notificação como lida", description = "Atualiza o status de uma notificação específica para lida.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Notificação marcada como lida com sucesso"),
        @ApiResponse(responseCode = "404", description = "Notificação não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    ResponseEntity<Void> marcarComoLida(
            @Parameter(description = "Identificador da notificação") UUID id
    );

    @Operation(summary = "Marcar todas notificações como lidas", description = "Atualiza o status de todas as notificações do segurado para lidas.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Todas as notificações marcadas como lidas"),
        @ApiResponse(responseCode = "403", description = "Acesso negado: segurado tentando alterar notificações de outro usuário"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    ResponseEntity<Void> marcarTodasComoLidas(
            @Parameter(description = "Identificador do segurado") UUID seguradoId
    );
}
