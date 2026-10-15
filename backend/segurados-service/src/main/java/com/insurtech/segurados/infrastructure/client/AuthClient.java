package com.insurtech.segurados.infrastructure.client;

import com.insurtech.segurados.infrastructure.client.dto.CadastrarUsuarioRequestDTO;
import com.insurtech.segurados.infrastructure.client.dto.UsuarioCriadoResponseDTO;
import com.insurtech.segurados.infrastructure.client.dto.UsuarioResponseDTO;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "auth-service", url = "${services.auth.url}")
public interface AuthClient {

    @PostMapping("/api/v1/auth/usuarios")
    UsuarioCriadoResponseDTO cadastrarUsuario(@RequestBody @Valid CadastrarUsuarioRequestDTO dto);

    @GetMapping("/api/v1/auth/usuarios/{id}")
    UsuarioResponseDTO buscarPorId(@PathVariable("id") UUID id);
}
