package com.insurtech.sinistros.infrastructure.persistence.outbox;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventJpaRepository extends JpaRepository<OutboxEventJpaEntity, UUID> {

    @Query("SELECT o FROM OutboxEventJpaEntity o WHERE o.status = 'PENDENTE' ORDER BY o.createdAt ASC")
    List<OutboxEventJpaEntity> findEventosPendentes(Pageable pageable);
}