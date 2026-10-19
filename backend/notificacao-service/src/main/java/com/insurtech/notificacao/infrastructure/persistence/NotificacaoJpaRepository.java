package com.insurtech.notificacao.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificacaoJpaRepository extends JpaRepository<NotificacaoEntity, UUID> {

    List<NotificacaoEntity> findAllByOrderByCriadoEmDesc();

    List<NotificacaoEntity> findByLidaOrderByCriadoEmDesc(boolean lida);

    List<NotificacaoEntity> findByLidaInternoOrderByCriadoEmDesc(boolean lidaInterno);

    List<NotificacaoEntity> findBySeguradoIdOrderByCriadoEmDesc(UUID seguradoId);

    List<NotificacaoEntity> findBySeguradoIdAndLidaOrderByCriadoEmDesc(UUID seguradoId, boolean lida);

    List<NotificacaoEntity> findBySeguradoIdAndLidaSeguradoOrderByCriadoEmDesc(UUID seguradoId, boolean lidaSegurado);

    @Modifying
    @Query("UPDATE NotificacaoEntity n SET n.lidaSegurado = true, n.lida = true WHERE n.seguradoId = :seguradoId")
    void marcarTodasComoLidasPorSegurado(@Param("seguradoId") UUID seguradoId);

    @Modifying
    @Query("UPDATE NotificacaoEntity n SET n.lidaInterno = true")
    void marcarTodasComoLidasInterno();

    @Modifying
    @Query("UPDATE NotificacaoEntity n SET n.lida = true, n.lidaSegurado = true, n.lidaInterno = true")
    void marcarTodasComoLidas();
}

