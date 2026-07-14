package com.insurtech.apolices.infrastructure.mapper;

import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.CoberturaRequestDTO;
import com.insurtech.apolices.application.dto.CoberturaResponseDTO;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Cobertura;
import com.insurtech.apolices.infrastructure.persistence.ApoliceJpaEntity;
import com.insurtech.apolices.infrastructure.persistence.CoberturaJpaEntity;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ApoliceMapper {

    public Apolice toDomain(ApoliceRequestDTO dto) {
        Apolice apolice = new Apolice();
        apolice.setSeguradoId(dto.seguradoId());
        apolice.setNumeroApolice(dto.numeroApolice());
        apolice.setTipoSeguro(dto.tipoSeguro());
        apolice.setValorSeguro(dto.valorSeguro());
        apolice.setValorPremio(dto.valorPremio());
        apolice.setDataInicioVigencia(dto.dataInicioVigencia());
        apolice.setDataFimVigencia(dto.dataFimVigencia());
        if (dto.coberturas() != null) {
            apolice.setCoberturas(dto.coberturas().stream().map(this::toDomain).collect(Collectors.toList()));
        }
        return apolice;
    }

    private Cobertura toDomain(CoberturaRequestDTO dto) {
        Cobertura cobertura = new Cobertura();
        cobertura.setTipoCobertura(dto.tipoCobertura());
        cobertura.setValorCobertura(dto.valorCobertura());
        cobertura.setValorFranquia(dto.valorFranquia());
        return cobertura;
    }

    public ApoliceJpaEntity toEntity(Apolice apolice) {
        ApoliceJpaEntity entity = new ApoliceJpaEntity();
        entity.setId(apolice.getId());
        entity.setSeguradoId(apolice.getSeguradoId());
        entity.setNumeroApolice(apolice.getNumeroApolice());
        entity.setTipoSeguro(apolice.getTipoSeguro());
        entity.setValorSeguro(apolice.getValorSeguro());
        entity.setValorPremio(apolice.getValorPremio());
        entity.setDataInicioVigencia(apolice.getDataInicioVigencia());
        entity.setDataFimVigencia(apolice.getDataFimVigencia());
        entity.setStatus(apolice.getStatus());
        entity.setCreatedAt(apolice.getCreatedAt());
        entity.setUpdatedAt(apolice.getUpdatedAt());
        
        if (apolice.getCoberturas() != null) {
            entity.setCoberturas(apolice.getCoberturas().stream().map(c -> {
                CoberturaJpaEntity coberturaEntity = new CoberturaJpaEntity();
                coberturaEntity.setId(c.getId());
                coberturaEntity.setApolice(entity);
                coberturaEntity.setTipoCobertura(c.getTipoCobertura());
                coberturaEntity.setValorCobertura(c.getValorCobertura());
                coberturaEntity.setValorFranquia(c.getValorFranquia());
                return coberturaEntity;
            }).collect(Collectors.toList()));
        }

        return entity;
    }

    public Apolice toDomain(ApoliceJpaEntity entity) {
        Apolice apolice = new Apolice();
        apolice.setId(entity.getId());
        apolice.setSeguradoId(entity.getSeguradoId());
        apolice.setNumeroApolice(entity.getNumeroApolice());
        apolice.setTipoSeguro(entity.getTipoSeguro());
        apolice.setValorSeguro(entity.getValorSeguro());
        apolice.setValorPremio(entity.getValorPremio());
        apolice.setDataInicioVigencia(entity.getDataInicioVigencia());
        apolice.setDataFimVigencia(entity.getDataFimVigencia());
        apolice.setStatus(entity.getStatus());
        apolice.setCreatedAt(entity.getCreatedAt());
        apolice.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getCoberturas() != null) {
            apolice.setCoberturas(entity.getCoberturas().stream().map(c -> {
                Cobertura cobertura = new Cobertura();
                cobertura.setId(c.getId());
                cobertura.setApoliceId(c.getApolice().getId());
                cobertura.setTipoCobertura(c.getTipoCobertura());
                cobertura.setValorCobertura(c.getValorCobertura());
                cobertura.setValorFranquia(c.getValorFranquia());
                return cobertura;
            }).collect(Collectors.toList()));
        }

        return apolice;
    }

    public ApoliceResponseDTO toResponse(Apolice apolice) {
        return new ApoliceResponseDTO(
                apolice.getId(),
                apolice.getSeguradoId(),
                apolice.getNumeroApolice(),
                apolice.getTipoSeguro(),
                apolice.getValorSeguro(),
                apolice.getValorPremio(),
                apolice.getDataInicioVigencia(),
                apolice.getDataFimVigencia(),
                apolice.getStatus(),
                apolice.getCoberturas() != null ? apolice.getCoberturas().stream().map(c -> new CoberturaResponseDTO(
                        c.getId(),
                        c.getTipoCobertura(),
                        c.getValorCobertura(),
                        c.getValorFranquia()
                )).collect(Collectors.toList()) : null,
                apolice.getCreatedAt()
        );
    }
}
