package com.insurtech.sinistros.infrastructure.client;

import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "apolices-service", url = "${services.apolices.url}")
public interface ApoliceClient {

    @GetMapping("/api/v1/apolices/{id}")
    ApoliceResponseDTO buscarPorId(@PathVariable("id") UUID id);
}
