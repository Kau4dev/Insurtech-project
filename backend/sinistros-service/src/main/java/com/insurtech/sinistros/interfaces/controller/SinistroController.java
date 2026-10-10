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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sinistros")
@RequiredArgsConstructor
public class SinistroController implements SinistroControllerDocs {

    private final CadastrarSinistroUseCase cadastrarSinistro;
    private final BuscarPorIdSinistroUseCase buscarPorIdSinistro;
    private final ListarSinistrosUseCase listarSinistros;
    private final AtribuirAnalistaUseCase atribuirAnalista;
    private final AguardarDocumentosUseCase aguardarDocumentos;
    private final AprovarSinistroUseCase aprovarSinistro;
    private final RejeitarSinistroUseCase rejeitarSinistro;
    private final AdicionarDocumentoUseCase adicionarDocumento;
    private final MostrarHistoricoStatusUseCase mostrarHistoricoStatus;
    private final MostrarMetricasUseCase mostrarMetricas;

    @Override
    @PostMapping
    public ResponseEntity<SinistroResponseDTO> registrarSinistro(@RequestBody @Valid SinistroRequestDTO dto) {
        SinistroResponseDTO sinistro = cadastrarSinistro.executar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(sinistro);
    }

    @Override
    @GetMapping
    public ResponseEntity<PageResponseDTO<SinistroResponseDTO>> listarSinistros(
            @RequestParam(required = false) String numeroSinistro,
            @RequestParam(required = false) UUID apoliceId,
            @RequestParam(required = false) UUID seguradoId,
            @RequestParam(required = false) UUID analistaId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) TipoSinistro tipoSinistro,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(listarSinistros.executar(numeroSinistro, apoliceId, seguradoId, analistaId, status, tipoSinistro, dataInicio, dataFim, pageable));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<SinistroDetalhadoResponseDTO> buscarPorId(@PathVariable UUID id) {
        SinistroDetalhadoResponseDTO sinistro = buscarPorIdSinistro.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @Override
    @PatchMapping("/{id}/atribuir")
    public ResponseEntity<SinistroResponseDTO> atribuirAnalista(
            @PathVariable UUID id,
            @RequestParam UUID analistaId) {
        SinistroResponseDTO sinistro = atribuirAnalista.executar(id, analistaId);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @Override
    @PatchMapping("/{id}/aguardar-documentos")
    public ResponseEntity<SinistroResponseDTO> aguardarDocumentos(@PathVariable UUID id) {
        SinistroResponseDTO sinistro = aguardarDocumentos.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @Override
    @CacheEvict(value = "dashboardMetricas", allEntries = true)
    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<SinistroResponseDTO> aprovar(
            @PathVariable UUID id,
            @RequestBody @Valid AprovarSinistroRequestDTO dto) {
        SinistroResponseDTO sinistro = aprovarSinistro.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @Override
    @CacheEvict(value = "dashboardMetricas", allEntries = true)
    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<SinistroResponseDTO> rejeitar(
            @PathVariable UUID id,
            @RequestBody @Valid RejeitarSinistroRequestDTO dto) {
        SinistroResponseDTO sinistro = rejeitarSinistro.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(sinistro);
    }

    @Override
    @PostMapping("/{id}/documentos")
    public ResponseEntity<DocumentoSinistroResponseDTO> adicionarDocumento(
            @PathVariable UUID id,
            @RequestBody @Valid AdicionarDocumentoRequestDTO dto) {
        DocumentoSinistroResponseDTO documento = adicionarDocumento.executar(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(documento);
    }

    @Override
    @GetMapping("/{id}/historico")
    public ResponseEntity<List<HistoricoSinistroResponseDTO>> mostrarHistorico(@PathVariable UUID id) {
        List<HistoricoSinistroResponseDTO> historico = mostrarHistoricoStatus.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(historico);
    }

    @Override
    @GetMapping("/dashboard/resumo")
    public ResponseEntity<DashboardResponseDTO> mostrarMetricas() {
        DashboardResponseDTO metricas = mostrarMetricas.executar();
        return ResponseEntity.status(HttpStatus.OK).body(metricas);
    }
}
