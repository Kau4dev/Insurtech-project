package com.insurtech.apolices.infrastructure.persistence;

import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ApoliceRepositoryImpl implements ApoliceRepository {

    private final ApoliceJpaRepository jpaRepository;
    private final ApoliceMapper mapper;

    @Override
    public Apolice salvar(Apolice apolice) {
        ApoliceJpaEntity entidade = mapper.toEntity(apolice);
        ApoliceJpaEntity salvo = jpaRepository.save(entidade);
        return mapper.toDomain(salvo);
    }

    @Override
    public Optional<Apolice> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Apolice> buscarPorNumero(String numeroApolice) {
        return jpaRepository.findByNumeroApolice(numeroApolice).map(mapper::toDomain);
    }

    @Override
    public Page<Apolice> listar(UUID seguradoId, Status status, TipoSeguro tipoSeguro, Pageable pageable) {
        return jpaRepository.findBySeguradoIdAndStatusAndTipoSeguro(seguradoId, status, tipoSeguro, pageable)
                .map(mapper::toDomain);
    }
}
