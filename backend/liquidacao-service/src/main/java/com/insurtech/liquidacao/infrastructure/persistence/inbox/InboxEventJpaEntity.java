package com.insurtech.liquidacao.infrastructure.persistence.inbox;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inbox_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InboxEventJpaEntity {

    @Id
    private UUID id;

    @Column(name = "message_id", nullable = false, unique = true, length = 100)
    private String messageId;

    @Column(name = "aggregate_id", nullable = false, length = 100)
    private String aggregateId;

    @Column(nullable = false, length = 100)
    private String topic;

    @Column(name = "consumer_group", nullable = false, length = 100)
    private String consumerGroup;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;
}