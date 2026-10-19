package com.insurtech.notificacao.infrastructure.persistence;

import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NotificacaoRepositoryImpl implements NotificacaoRepository {

    private final NotificacaoJpaRepository jpaRepository;

    @Override
    @Transactional
    public Notificacao salvar(Notificacao domain) {
        NotificacaoEntity entity = toEntity(domain);
        NotificacaoEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Notificacao> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Notificacao> listarPorSeguradoId(UUID seguradoId, Boolean apenasNaoLidas) {
        List<NotificacaoEntity> entities;
        if (Boolean.TRUE.equals(apenasNaoLidas)) {
            entities = jpaRepository.findBySeguradoIdAndLidaSeguradoOrderByCriadoEmDesc(seguradoId, false);
        } else {
            entities = jpaRepository.findBySeguradoIdOrderByCriadoEmDesc(seguradoId);
        }
        return entities.stream().map(this::toDomain).toList();
    }

    @Override
    public List<Notificacao> listarTodas(Boolean apenasNaoLidas) {
        List<NotificacaoEntity> entities;
        if (Boolean.TRUE.equals(apenasNaoLidas)) {
            entities = jpaRepository.findByLidaInternoOrderByCriadoEmDesc(false);
        } else {
            entities = jpaRepository.findAllByOrderByCriadoEmDesc();
        }
        return entities.stream().map(this::toDomain).toList();
    }

    @Override
    @Transactional
    public void marcarTodasComoLidasPorSegurado(UUID seguradoId) {
        jpaRepository.marcarTodasComoLidasPorSegurado(seguradoId);
    }

    @Override
    @Transactional
    public void marcarTodasComoLidasInterno() {
        jpaRepository.marcarTodasComoLidasInterno();
    }

    @Override
    @Transactional
    public void marcarTodasComoLidas() {
        jpaRepository.marcarTodasComoLidas();
    }

    private NotificacaoEntity toEntity(Notificacao domain) {
        return new NotificacaoEntity(
                domain.getId(),
                domain.getSeguradoId(),
                domain.getTitulo(),
                domain.getMensagem(),
                domain.getTipo(),
                domain.isLida(),
                domain.isLidaSegurado(),
                domain.isLidaInterno(),
                domain.getCriadoEm()
        );
    }

    private Notificacao toDomain(NotificacaoEntity entity) {
        Notificacao domain = new Notificacao();
        domain.setId(entity.getId());
        domain.setSeguradoId(entity.getSeguradoId());
        domain.setTitulo(entity.getTitulo());
        domain.setMensagem(entity.getMensagem());
        domain.setTipo(entity.getTipo());
        domain.setLida(entity.isLida());
        domain.setLidaSegurado(entity.isLidaSegurado());
        domain.setLidaInterno(entity.isLidaInterno());
        domain.setCriadoEm(entity.getCriadoEm());
        return domain;
    }
}

