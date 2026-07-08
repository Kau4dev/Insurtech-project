package com.insurtech.segurados.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface SeguradoJpaRepository extends JpaRepository<SeguradoJpaEntity, UUID> {


    Optional<SeguradoJpaEntity> findByCpfCnpj(String cpfCnpj);

    @Query("SELECT s FROM SeguradoJpaEntity s WHERE " +
            "(:nome IS NULL OR LOWER(s.nomeRazaoSocial) LIKE LOWER(CONCAT('%', :nome, '%')))")
    Page<SeguradoJpaEntity> findByNameContaining(String nome, Pageable pageable);
}

