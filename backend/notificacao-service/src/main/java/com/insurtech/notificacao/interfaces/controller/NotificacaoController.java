package com.insurtech.notificacao.interfaces.controller;

import com.insurtech.notificacao.application.dto.NotificacaoResponseDTO;
import com.insurtech.notificacao.application.usecase.BuscarNotificacoesUseCase;
import com.insurtech.notificacao.application.usecase.MarcarNotificacaoComoLidaUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final BuscarNotificacoesUseCase buscarNotificacoesUseCase;
    private final MarcarNotificacaoComoLidaUseCase marcarNotificacaoComoLidaUseCase;

    @GetMapping
    public ResponseEntity<List<NotificacaoResponseDTO>> listarNotificacoes(
            @RequestParam(value = "seguradoId", required = false) UUID seguradoId,
            @RequestParam(value = "apenasNaoLidas", required = false) Boolean apenasNaoLidas
    ) {
        return ResponseEntity.ok(buscarNotificacoesUseCase.executar(seguradoId, apenasNaoLidas));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable UUID id) {
        marcarNotificacaoComoLidaUseCase.executar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/marcar-todas-lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(
            @RequestParam(value = "seguradoId", required = false) UUID seguradoId
    ) {
        marcarNotificacaoComoLidaUseCase.executarMarcarTodas(seguradoId);
        return ResponseEntity.noContent().build();
    }
}

