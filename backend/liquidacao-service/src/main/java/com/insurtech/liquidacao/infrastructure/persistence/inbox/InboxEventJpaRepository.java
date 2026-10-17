package com.insurtech.liquidacao.infrastructure.persistence.inbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InboxEventJpaRepository extends JpaRepository<InboxEventJpaEntity, UUID> {

    boolean existsByMessageId(String messageId);
}