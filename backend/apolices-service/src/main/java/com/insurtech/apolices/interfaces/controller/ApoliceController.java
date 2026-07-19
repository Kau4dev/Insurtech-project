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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/v1/apolices")
@RequiredArgsConstructor
public class ApoliceController {

    private final CadastrarApoliceUseCase cadastrarApoliceUseCase;
    private final BuscarPorIdApoliceUseCase buscarPorIdApoliceUseCase;
    private final BuscarPorNumeroApoliceUseCase buscarPorNumeroApoliceUseCase;
    private final ListarApolicesUseCase listarApolicesUseCase;
    private final AtualizarStatusApoliceUseCase atualizarStatusApoliceUseCase;


    @PostMapping
    public ResponseEntity<ApoliceResponseDTO> cadastrarApolice(@RequestBody @Valid ApoliceRequestDTO dto) {
        ApoliceResponseDTO apolice = cadastrarApoliceUseCase.executar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(apolice);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApoliceResponseDTO> buscarPorId(@PathVariable UUID id) {
        ApoliceResponseDTO apolice = buscarPorIdApoliceUseCase.executar(id);
        return ResponseEntity.status(HttpStatus.OK).body(apolice);
    }

    @GetMapping("/numero/{numeroApolice}")
    public ResponseEntity<ApoliceResponseDTO> buscarPorNumero(@PathVariable String numeroApolice) {
        ApoliceResponseDTO apolice = buscarPorNumeroApoliceUseCase.executar(numeroApolice);
        return ResponseEntity.status(HttpStatus.OK).body(apolice);
    }


    @GetMapping
    public ResponseEntity<PageResponseDTO<ApoliceResponseDTO>> listarApolices(
            @RequestParam(required = false) UUID IdSegurado,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) TipoSeguro tipoSeguro,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(listarApolicesUseCase.executar(IdSegurado, status, tipoSeguro, pageable));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApoliceResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody @Valid AtualizarStatusApoliceDTO dto) throws StatusNaoSuportadoException {
        ApoliceResponseDTO apolice = atualizarStatusApoliceUseCase.executar(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(apolice);
    }

}
