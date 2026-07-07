package com.insurtech.segurados.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SeguradoJpaRepository extends JpaRepository<SeguradoJpaEntity, UUID> {


    Optional<SeguradoJpaEntity> findById(UUID id);
    Optional<SeguradoJpaEntity> findByCpfCnpj(String cpfCnpj);
    Page<SeguradoJpaEntity> findByNameContaining(String nome, Pageable pageable);
}

