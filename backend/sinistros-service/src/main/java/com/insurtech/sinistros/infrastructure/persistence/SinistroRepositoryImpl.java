package com.insurtech.sinistros.infrastructure.persistence;

import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class SinistroRepositoryImpl implements SinistroRepository {

    private final SinistroJpaRepository jpaRepository;
    private final SinistroMapper mapper;


    @Override
    public Sinistro salvar(Sinistro sinistro) {
        SinistroJpaEntity entidade = mapper.toEntity(sinistro);
        SinistroJpaEntity salvo = jpaRepository.save(entidade);
        return mapper.toDomain(salvo);
    }

    @Override
    public Optional<Sinistro> buscarPorId(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Sinistro> buscarPorNumero(String numeroApolice) {
        return jpaRepository.findByNumeroSinistro(numeroApolice).map(mapper::toDomain);
    }

    @Override
    public Page<Sinistro> listar(
            UUID apoliceId,
            UUID seguradoId,
            UUID analistaId,
            Status status,
            TipoSinistro tipoSinistro,
            LocalDate dataInicio,
            LocalDate dataFim,
            Pageable pageable
    ) {
        return jpaRepository.buscarComFiltros(
                        apoliceId,
                        seguradoId,
                        analistaId,
                        status,
                        tipoSinistro,
                        dataInicio,
                        dataFim,
                        pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Map<Status, Long> contarPorStatus() {
        return jpaRepository.contarPorStatus()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Status) row[0],
                        row -> (Long) row[1]
                ));
    }

    @Override
    public BigDecimal somarValorEstimadoPorStatus(Status status) {
        return jpaRepository.somarValorEstimadoPorStatus(status);
    }

    @Override
    public BigDecimal somarValorAprovadoPorStatus(List<Status> statuses) {
        return jpaRepository.somarValorAprovadoPorStatus(statuses);
    }
}
