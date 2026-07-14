package com.insurtech.apolices.infrastructure.persistence;

import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ApoliceJpaRepository extends JpaRepository<ApoliceJpaEntity, UUID> {

    Optional<ApoliceJpaEntity> findByNumeroApolice(String numeroApolice);
    Page<ApoliceJpaEntity> findBySeguradoIdAndStatusAndTipoSeguro(UUID seguradoId, Status status, TipoSeguro tipoSeguro, Pageable pageable);

}
