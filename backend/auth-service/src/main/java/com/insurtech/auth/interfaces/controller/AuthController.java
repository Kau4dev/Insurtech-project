package com.insurtech.auth.interfaces.controller;

import java.util.List;
import java.util.UUID;

import com.insurtech.auth.application.dto.*;
import com.insurtech.auth.application.usecase.CadastrarUsuarioUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.insurtech.auth.application.usecase.BuscarUsuarioUseCase;
import com.insurtech.auth.application.usecase.LoginUseCase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController implements AuthControllerDocs {

    private final LoginUseCase login;
    private final BuscarUsuarioUseCase buscarUsuario;

    @Override
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(login.executar(dto));
    }

    @Override
    @GetMapping("/validar")
    public ResponseEntity<UsuarioResponseDTO> validarToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(buscarUsuario.executarPorToken(token));
    }

}