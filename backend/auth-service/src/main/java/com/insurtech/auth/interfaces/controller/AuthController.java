package com.insurtech.auth.interfaces.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.LoginResponseDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.application.usecase.BuscarUsuarioUseCase;
import com.insurtech.auth.application.usecase.LoginUseCase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController implements AuthControllerDocs {

    private final LoginUseCase loginUseCase;
    private final BuscarUsuarioUseCase buscarUsuarioUseCase;

    @Override
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(loginUseCase.executar(dto));
    }

    @Override
    @GetMapping("/validar")
    public ResponseEntity<UsuarioResponseDTO> validarToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(buscarUsuarioUseCase.executarPorToken(token));
    }

    @Override
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarUsuarioPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(buscarUsuarioUseCase.executarPorId(id));
    }

    @Override
    @GetMapping("/usuarios")
    public ResponseEntity<java.util.List<UsuarioResponseDTO>> listarUsuarios() {
        return ResponseEntity.ok(buscarUsuarioUseCase.listarTodos());
    }
}