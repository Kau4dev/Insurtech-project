package com.insurtech.sinistros.infrastructure.client;

import com.insurtech.sinistros.infrastructure.client.dto.UsuarioResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "auth-service", url = "${services.auth.url}")
public interface AuthClient {

    @GetMapping("/api/v1/auth/usuarios/{id}")
    UsuarioResponseDTO buscarPorId(@PathVariable("id") UUID id);
}
