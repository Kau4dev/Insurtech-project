package com.insurtech.liquidacao.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventoPagamentoJpaRepository extends JpaRepository<EventoPagamentoJpaEntity, UUID> {

    boolean existsByEventoIdOrigem(String eventoIdOrigem);

}
