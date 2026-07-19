package com.insurtech.apolices.infrastructure.client;

import com.insurtech.apolices.infrastructure.client.dto.SeguradoResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "segurados-service", url = "${services.segurados.url}")
public interface SeguradoClient {

    @GetMapping("/api/v1/segurados/{id}")
    SeguradoResponseDTO buscarPorId(@PathVariable("id") UUID id);
}