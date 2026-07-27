package com.insurtech.segurados.infrastructure.mapper;

import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.infrastructure.persistence.SeguradoJpaEntity;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SeguradoMapper {

    Segurado toDomain(SeguradoRequestDTO dto);

    SeguradoJpaEntity toEntity(Segurado segurado);

    Segurado toDomain(SeguradoJpaEntity entity);

    SeguradoResponseDTO toResponse(Segurado segurado);
}
