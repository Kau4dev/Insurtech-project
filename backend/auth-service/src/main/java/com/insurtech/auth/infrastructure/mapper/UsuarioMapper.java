package com.insurtech.auth.infrastructure.mapper;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.infrastructure.persistence.UsuarioJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UsuarioMapper {

    Usuario toDomain(LoginRequestDTO dto);

    UsuarioJpaEntity toEntity(Usuario usuario);

    Usuario toDomain(UsuarioJpaEntity entity);

    UsuarioResponseDTO toResponse(Usuario usuario);
}
