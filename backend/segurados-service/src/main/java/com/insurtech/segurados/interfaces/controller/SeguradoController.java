package com.insurtech.segurados.interfaces.controller;

import com.insurtech.segurados.application.dto.PageResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.application.usecase.AtualizarSeguradoUseCase;
import com.insurtech.segurados.application.usecase.BuscarPorIdSeguradoUseCase;
import com.insurtech.segurados.application.usecase.CadastrarSeguradoUseCase;
import com.insurtech.segurados.application.usecase.ListarSeguradosUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/v1/segurados")
@RequiredArgsConstructor
public class SeguradoController {

    private final CadastrarSeguradoUseCase cadastrarSeguradoUseCase;
    private final BuscarPorIdSeguradoUseCase buscarPorIdSeguradoUseCase;
    private final ListarSeguradosUseCase listarSeguradosUseCase;
    private final AtualizarSeguradoUseCase atualizarSeguradoUseCase;

    @PostMapping
    public ResponseEntity<SeguradoResponseDTO> cadastrarSegurado(@RequestBody @Valid SeguradoRequestDTO dto) {
        SeguradoResponseDTO segurado = cadastrarSeguradoUseCase.executar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(segurado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeguradoResponseDTO> buscarPorId(@PathVariable UUID id) {
        SeguradoResponseDTO segurado = buscarPorIdSeguradoUseCase.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(segurado);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<SeguradoResponseDTO>> listarSegurados(
            @RequestParam(required = false) String nome,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(listarSeguradosUseCase.executar(nome, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeguradoResponseDTO> atualizarSegurado(
            @PathVariable UUID id,
            @RequestBody @Valid SeguradoUpdateDTO dto) {
        SeguradoResponseDTO segurado = atualizarSeguradoUseCase.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(segurado);
    }

}
