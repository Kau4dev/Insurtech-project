package com.insurtech.segurados.application.usecase;


import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.exception.CpfCnpjJaCadastradoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CadastrarSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public SeguradoResponseDTO cadastrar(SeguradoRequestDTO dto) {

        repository.buscarPorCpfCnpj(dto.cpfCnpj())
                .ifPresent(s -> { throw new CpfCnpjJaCadastradoException("CPF/CNPJ já cadastrado: " + dto.cpfCnpj()); });

        Segurado segurado = mapper.toDomain(dto);
        segurado.setId(UUID.randomUUID());
        segurado.setCreatedAt(Instant.now());

        segurado.validar();

        Segurado salvo = repository.salvar(segurado);

        return mapper.toResponse(salvo);

    }

}
