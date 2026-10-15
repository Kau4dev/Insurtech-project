package com.insurtech.apolices.interfaces.controller;

import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.AtualizarStatusApoliceDTO;
import com.insurtech.apolices.application.dto.PageResponseDTO;
import com.insurtech.apolices.application.usecase.*;
import com.insurtech.apolices.domain.exception.StatusNaoSuportadoException;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/apolices")
@RequiredArgsConstructor
public class ApoliceController implements ApoliceControllerDocs {

    private final CadastrarApoliceUseCase cadastrarApolice;
    private final BuscarPorIdApoliceUseCase buscarPorIdApolice;
    private final ListarApolicesUseCase listarApolices;
    private final AtualizarStatusApoliceUseCase atualizarStatusApolice;

    @Override
    @PostMapping
    public ResponseEntity<ApoliceResponseDTO> cadastrarApolice(@RequestBody @Valid ApoliceRequestDTO dto) {
        ApoliceResponseDTO apolice = cadastrarApolice.executar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(apolice);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ApoliceResponseDTO> buscarPorId(@PathVariable UUID id) {
        ApoliceResponseDTO apolice = buscarPorIdApolice.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(apolice);
    }

    @Override
    @GetMapping
    public ResponseEntity<PageResponseDTO<ApoliceResponseDTO>> listarApolices(
            @RequestParam(required = false) String numeroApolice,
            @RequestParam(required = false) UUID idSegurado,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) TipoSeguro tipoSeguro,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(listarApolices.executar(numeroApolice, idSegurado, status, tipoSeguro, pageable));
    }

    @Override
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApoliceResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody @Valid AtualizarStatusApoliceDTO dto) throws StatusNaoSuportadoException {
        ApoliceResponseDTO apolice = atualizarStatusApolice.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(apolice);
    }
}
