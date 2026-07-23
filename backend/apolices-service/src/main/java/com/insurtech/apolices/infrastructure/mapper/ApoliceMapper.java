package com.insurtech.apolices.infrastructure.mapper;

import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.CoberturaRequestDTO;
import com.insurtech.apolices.application.dto.CoberturaResponseDTO;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Cobertura;
import com.insurtech.apolices.infrastructure.persistence.ApoliceJpaEntity;
import com.insurtech.apolices.infrastructure.persistence.CoberturaJpaEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ApoliceMapper {

    Apolice toDomain(ApoliceRequestDTO dto);

    Cobertura toDomain(CoberturaRequestDTO dto);

    ApoliceJpaEntity toEntity(Apolice apolice);

    @AfterMapping
    default void linkCoberturas(@MappingTarget ApoliceJpaEntity entity) {
        if (entity.getCoberturas() != null) {
            entity.getCoberturas().forEach(c -> c.setApolice(entity));
        }
    }

    Apolice toDomain(ApoliceJpaEntity entity);
    
    @AfterMapping
    default void linkCoberturaDomain(@MappingTarget Apolice apolice) {
        if (apolice.getCoberturas() != null) {
            apolice.getCoberturas().forEach(c -> c.setApoliceId(apolice.getId()));
        }
    }

    ApoliceResponseDTO toResponse(Apolice apolice);
    
    CoberturaResponseDTO toResponse(Cobertura cobertura);
}
