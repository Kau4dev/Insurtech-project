package com.insurtech.auth.interfaces.controller;

import com.insurtech.auth.application.dto.CadastrarUsuarioRequestDTO;
import com.insurtech.auth.application.dto.UsuarioCriadoResponseDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.application.usecase.AtualizarUsuarioUseCase;
import com.insurtech.auth.application.usecase.BuscarUsuarioUseCase;
import com.insurtech.auth.application.usecase.CadastrarUsuarioUseCase;
import com.insurtech.auth.application.usecase.DeletarUsuarioUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/usuarios")
@RequiredArgsConstructor
public class UsuarioController implements UsuarioControllerDocs {

    private final CadastrarUsuarioUseCase cadastrarUsuario;
    private final BuscarUsuarioUseCase buscarUsuario;
    private final AtualizarUsuarioUseCase atualizarUsuario;
    private final DeletarUsuarioUseCase deletarUsuario;

    @Override
    @PostMapping
    public ResponseEntity<UsuarioCriadoResponseDTO> cadastrarUsuario(@RequestBody @Valid CadastrarUsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastrarUsuario.executar(dto));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarUsuarioPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(buscarUsuario.executarPorId(id));
    }

    @Override
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios(@RequestParam(value = "ativo", required = false) Boolean ativo) {
        return ResponseEntity.ok(buscarUsuario.listarTodos(ativo));
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(@PathVariable UUID id) {
        return ResponseEntity.ok(atualizarUsuario.executar(id));
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable UUID id) {
        deletarUsuario.executar(id);
        return ResponseEntity.noContent().build();
    }
}
