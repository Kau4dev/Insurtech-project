package com.insurtech.segurados.application.usecase;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListarSeguradosUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;


    public List<SeguradoResponseDTO> listarSegurados(String nome, Pageable pageable) {
        return repository.listar(nome, pageable)
                .map(mapper::toResponse)
                .getContent();
    }
}
