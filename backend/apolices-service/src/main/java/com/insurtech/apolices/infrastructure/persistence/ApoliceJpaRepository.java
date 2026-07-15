package com.insurtech.apolices.infrastructure.persistence;

import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface ApoliceJpaRepository extends JpaRepository<ApoliceJpaEntity, UUID> {

    Optional<ApoliceJpaEntity> findByNumeroApolice(String numeroApolice);

    @Query("SELECT a FROM ApoliceJpaEntity a WHERE " +
           "(:seguradoId IS NULL OR a.seguradoId = :seguradoId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:tipoSeguro IS NULL OR a.tipoSeguro = :tipoSeguro)")
    Page<ApoliceJpaEntity> findBySeguradoIdAndStatusAndTipoSeguro(
            @Param("seguradoId") UUID seguradoId, 
            @Param("status") Status status, 
            @Param("tipoSeguro") TipoSeguro tipoSeguro, 
            Pageable pageable);

}
