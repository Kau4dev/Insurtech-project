package com.insurtech.notificacao.interfaces.controller;

import com.insurtech.notificacao.application.dto.NotificacaoResponseDTO;
import com.insurtech.notificacao.application.usecase.BuscarNotificacoesUseCase;
import com.insurtech.notificacao.application.usecase.MarcarNotificacaoComoLidaUseCase;
import com.insurtech.notificacao.infrastructure.security.UserContext;
import com.insurtech.notificacao.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController implements NotificacaoControllerDocs {

    private final BuscarNotificacoesUseCase buscarNotificacoesUseCase;
    private final MarcarNotificacaoComoLidaUseCase marcarNotificacaoComoLidaUseCase;

    @Override
    @GetMapping
    public ResponseEntity<List<NotificacaoResponseDTO>> listarNotificacoes(
            @RequestParam(value = "seguradoId", required = false) UUID seguradoId,
            @RequestParam(value = "apenasNaoLidas", required = false) Boolean apenasNaoLidas
    ) {
        validarAcessoSegurado(seguradoId);
        return ResponseEntity.ok(buscarNotificacoesUseCase.executar(seguradoId, apenasNaoLidas));
    }

    @Override
    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable UUID id) {
        marcarNotificacaoComoLidaUseCase.executar(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PatchMapping("/marcar-todas-lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(
            @RequestParam(value = "seguradoId", required = false) UUID seguradoId
    ) {
        validarAcessoSegurado(seguradoId);
        marcarNotificacaoComoLidaUseCase.executarMarcarTodas(seguradoId);
        return ResponseEntity.noContent().build();
    }

    private void validarAcessoSegurado(UUID seguradoId) {
        UserContext ctx = UserContextHolder.getContext();
        if (ctx != null && "SEGURADO".equalsIgnoreCase(ctx.getUsuarioPapel()) && seguradoId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Segurados devem obrigatoriamente especificar seu seguradoId");
        }
    }
}
