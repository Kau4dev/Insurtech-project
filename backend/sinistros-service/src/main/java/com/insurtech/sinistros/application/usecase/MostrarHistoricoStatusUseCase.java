package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.HistoricoSinistroResponseDTO;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MostrarHistoricoStatusUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final SinistroSecurityValidator securityValidator;

    public List<HistoricoSinistroResponseDTO> executar(UUID id) {
        securityValidator.validarAutenticacao();

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        securityValidator.validarPropriedadeSegurado(
                sinistro.getSeguradoId(),
                "Acesso negado. Você só pode visualizar o histórico dos seus próprios sinistros."
        );

        return sinistro.getHistorico().stream()
                .map(mapper::toResponse)
                .toList();
    }
}
