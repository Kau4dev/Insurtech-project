package com.insurtech.sinistros.interfaces.controller;

import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.request.AprovarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.request.RejeitarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.*;
import com.insurtech.sinistros.application.usecase.*;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/sinistros")
@RequiredArgsConstructor
public class SinistroController {

    private final CadastrarSinistroUseCase cadastrarSinistroUseCase;
    private final BuscarPorIdSinistroUseCase buscarPorIdSinistroUseCase;
    private final ListarSinistrosUseCase listarSinistrosUseCase;
    private final AtribuirAnalistaUseCase atribuirAnalistaUseCase;
    private final AprovarSinistroUseCase aprovarSinistroUseCase;
    private final RejeitarSinistroUseCase rejeitarSinistroUseCase;
    private final AdicionarDocumentoUseCase adicionarDocumentoUseCase;
    private final MostrarHistoricoStatusUseCase mostrarHistoricoStatusUseCase;
    private final MostrarMetricasUseCase mostrarMetricasUseCase;

    @PostMapping
    public ResponseEntity<SinistroResponseDTO> registrarSinistro(@RequestBody @Valid SinistroRequestDTO dto) {
        SinistroResponseDTO sinistro = cadastrarSinistroUseCase.executar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(sinistro);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<SinistroResponseDTO>> listarSinistros(
            @RequestParam(required = false) UUID apoliceId,
            @RequestParam(required = false) UUID seguradoId,
            @RequestParam(required = false) UUID analistaId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) TipoSinistro tipoSinistro,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(listarSinistrosUseCase.executar(apoliceId, seguradoId, analistaId, status, tipoSinistro, dataInicio, dataFim, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SinistroDetalhadoResponseDTO> buscarPorId(@PathVariable UUID id) {
        SinistroDetalhadoResponseDTO sinistro = buscarPorIdSinistroUseCase.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @PatchMapping("/{id}/atribuir")
    public ResponseEntity<SinistroResponseDTO> atribuirAnalista(
            @PathVariable UUID id,
            @RequestParam UUID analistaId) {
        SinistroResponseDTO sinistro = atribuirAnalistaUseCase.executar(id, analistaId);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<SinistroResponseDTO> aprovar(
            @PathVariable UUID id,
            @RequestBody @Valid AprovarSinistroRequestDTO dto) {
        SinistroResponseDTO sinistro = aprovarSinistroUseCase.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<SinistroResponseDTO> rejeitar(
            @PathVariable UUID id,
            @RequestBody @Valid RejeitarSinistroRequestDTO dto) {
        SinistroResponseDTO sinistro = rejeitarSinistroUseCase.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @PostMapping("/{id}/documentos")
    public ResponseEntity<DocumentoSinistroResponseDTO> adicionarDocumento(
            @PathVariable UUID id,
            @RequestBody @Valid AdicionarDocumentoRequestDTO dto) {
        DocumentoSinistroResponseDTO documento = adicionarDocumentoUseCase.executar(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(documento);
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<List<HistoricoSinistroResponseDTO>> mostrarHistorico(@PathVariable UUID id) {
        List<HistoricoSinistroResponseDTO> historico = mostrarHistoricoStatusUseCase.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(historico);
    }

    @GetMapping("/dashboard/resumo")
    public ResponseEntity<DashboardResponseDTO> mostrarMetricas() {
        DashboardResponseDTO metricas = mostrarMetricasUseCase.executar();
        return ResponseEntity.status(HttpStatus.OK).body(metricas);
    }

}
