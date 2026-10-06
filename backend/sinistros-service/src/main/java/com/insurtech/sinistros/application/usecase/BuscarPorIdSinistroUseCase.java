package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.SinistroDetalhadoResponseDTO;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuscarPorIdSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final SinistroSecurityValidator securityValidator;

    public SinistroDetalhadoResponseDTO executar(UUID id) {
        securityValidator.validarAutenticacao();

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        securityValidator.validarPropriedadeSegurado(
                sinistro.getSeguradoId(),
                "Acesso negado. Você só pode visualizar seus próprios sinistros."
        );

        return mapper.toDetalhadoResponse(sinistro);
    }
}
