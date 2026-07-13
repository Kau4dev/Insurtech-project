package com.insurtech.apolices.domain.repository;

import com.insurtech.apolices.domain.model.Apolice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ApoliceRepository {
    Apolice salvar(Apolice apolice);
    Optional<Apolice> buscarPorId(UUID id);
    Page<Apolice> listar(String nome, Pageable pageable);
}
