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
           "(CAST(:numeroApolice AS string) IS NULL OR LOWER(a.numeroApolice) LIKE LOWER(CONCAT('%', CAST(:numeroApolice AS string), '%'))) AND " +
           "(:seguradoId IS NULL OR a.seguradoId = :seguradoId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:tipoSeguro IS NULL OR a.tipoSeguro = :tipoSeguro)")
    Page<ApoliceJpaEntity> findBySeguradoIdAndStatusAndTipoSeguro(
            @Param("numeroApolice") String numeroApolice,
            @Param("seguradoId") UUID seguradoId, 
            @Param("status") Status status, 
            @Param("tipoSeguro") TipoSeguro tipoSeguro, 
            Pageable pageable);

}
