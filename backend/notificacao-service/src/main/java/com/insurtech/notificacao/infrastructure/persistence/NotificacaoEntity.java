package com.insurtech.notificacao.infrastructure.persistence;

import com.insurtech.notificacao.domain.model.TipoNotificacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notificacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificacaoEntity {

    @Id
    private UUID id;

    @Column(name = "segurado_id", nullable = false)
    private UUID seguradoId;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacao tipo;

    @Column(nullable = false)
    private boolean lida;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;
}

