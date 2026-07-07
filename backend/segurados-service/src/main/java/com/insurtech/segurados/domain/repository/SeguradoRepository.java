package com.insurtech.segurados.domain.repository;

import com.insurtech.segurados.domain.model.Segurado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface SeguradoRepository {
    Segurado salvar(Segurado segurado);
    Optional<Segurado> buscarPorId(UUID id);
    Optional<Segurado> buscarPorCpfCnpj(String cpfCnpj);
    Page<Segurado> listar(String nome, Pageable pageable);
}
