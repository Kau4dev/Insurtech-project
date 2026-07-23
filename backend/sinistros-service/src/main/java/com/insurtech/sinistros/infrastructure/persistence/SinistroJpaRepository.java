package com.insurtech.sinistros.infrastructure.persistence;


import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SinistroJpaRepository extends JpaRepository<SinistroJpaEntity, UUID> {

    Optional<SinistroJpaEntity> findByNumeroSinistro(String numeroSinistro);

    @Query("SELECT s FROM SinistroJpaEntity s WHERE " +
            "(:apoliceId IS NULL OR s.apoliceId = :apoliceId) AND " +
            "(:seguradoId IS NULL OR s.seguradoId = :seguradoId) AND " +
            "(:analistaId IS NULL OR s.analistaId = :analistaId) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:tipoSinistro IS NULL OR s.tipoSinistro = :tipoSinistro) AND " +
            "(CAST(:dataInicio AS date) IS NULL OR s.dataOcorrencia >= :dataInicio) AND " +
            "(CAST(:dataFim AS date) IS NULL OR s.dataOcorrencia <= :dataFim)")
    Page<SinistroJpaEntity> buscarComFiltros(
            @Param("apoliceId") UUID apoliceId,
            @Param("seguradoId") UUID seguradoId,
            @Param("analistaId") UUID analistaId,
            @Param("status") Status status,
            @Param("tipoSinistro") TipoSinistro tipoSinistro,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            Pageable pageable
    );

    @Query("SELECT s.status, COUNT(s) FROM SinistroJpaEntity s GROUP BY s.status")
    List<Object[]> contarPorStatus();

    @Query("SELECT COALESCE(SUM(s.valorEstimado), 0) FROM SinistroJpaEntity s WHERE s.status = :status")
    BigDecimal somarValorEstimadoPorStatus(@Param("status") Status status);

    @Query("SELECT COALESCE(SUM(s.valorAprovado), 0) FROM SinistroJpaEntity s WHERE s.status IN :statuses")
    BigDecimal somarValorAprovadoPorStatus(@Param("statuses") List<Status> statuses);

}
