package com.insurtech.segurados.interfaces.controller;

import com.insurtech.segurados.application.dto.PageResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.application.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/segurados")
@RequiredArgsConstructor
public class SeguradoController implements SeguradoControllerDocs {

    private final CadastrarSeguradoUseCase cadastrarSegurado;
    private final BuscarPorIdSeguradoUseCase buscarPorIdSegurado;
    private final ListarSeguradosUseCase listarSegurados;
    private final AtualizarSeguradoUseCase atualizarSegurado;
    private final BuscarMeuSeguradoUseCase buscarMeuSegurado;

    @Override
    @PostMapping
    public ResponseEntity<SeguradoResponseDTO> cadastrarSegurado(@RequestBody @Valid SeguradoRequestDTO dto) {
        SeguradoResponseDTO segurado = cadastrarSegurado.executar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(segurado);
    }

    @Override
    @GetMapping("/me")
    public ResponseEntity<SeguradoResponseDTO> buscarMeuSegurado() {
        SeguradoResponseDTO segurado = buscarMeuSegurado.executar();
        return ResponseEntity.status(HttpStatus.OK).body(segurado);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<SeguradoResponseDTO> buscarPorId(@PathVariable UUID id) {
        SeguradoResponseDTO segurado = buscarPorIdSegurado.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(segurado);
    }

    @Override
    @GetMapping
    public ResponseEntity<PageResponseDTO<SeguradoResponseDTO>> listarSegurados(
            @RequestParam(required = false) String nome,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(listarSegurados.executar(nome, pageable));
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<SeguradoResponseDTO> atualizarSegurado(
            @PathVariable UUID id,
            @RequestBody @Valid SeguradoUpdateDTO dto) {
        SeguradoResponseDTO segurado = atualizarSegurado.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(segurado);
    }
}
