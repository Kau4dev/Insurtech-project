package com.insurtech.segurados.infrastructure.persistence;

import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SeguradoRepositoryImpl implements SeguradoRepository {

    private final SeguradoJpaRepository jpaRepository;
    private final SeguradoMapper mapper;

    @Override
    public Segurado salvar(Segurado segurado) {
        SeguradoJpaEntity entidade = mapper.toEntity(segurado);
        SeguradoJpaEntity salvo = jpaRepository.save(entidade);
        return mapper.toDomain(salvo);
    }

    @Override
    public Optional<Segurado> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Segurado> buscarPorCpfCnpj(String cpfCnpj) {
        return jpaRepository.findByCpfCnpj(cpfCnpj).map(mapper::toDomain);
    }

    @Override
    public Page<Segurado> listar(String nome, Pageable pageable) {
        return jpaRepository.findByNameContaining(nome, pageable).map(mapper::toDomain);
    }
}
