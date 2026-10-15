package com.insurtech.auth.infrastructure.mapper;

import com.insurtech.auth.application.dto.CadastrarUsuarioRequestDTO;
import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.UsuarioCriadoResponseDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.infrastructure.persistence.UsuarioJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UsuarioMapper {

    Usuario toDomain(CadastrarUsuarioRequestDTO dto);

    Usuario toDomain(LoginRequestDTO dto);

    UsuarioJpaEntity toEntity(Usuario usuario);

    Usuario toDomain(UsuarioJpaEntity entity);

    @Mapping(target = "id", source = "usuario.id")
    @Mapping(target = "nome", source = "usuario.nome")
    @Mapping(target = "email", source = "usuario.email")
    @Mapping(target = "papel", source = "usuario.papel")
    @Mapping(target = "ativo", source = "usuario.ativo")
    @Mapping(target = "createdAt", source = "usuario.createdAt")
    @Mapping(target = "senhaTemporaria", source = "senhaTemporaria")
    UsuarioCriadoResponseDTO toResponse(Usuario usuario, String senhaTemporaria);

    UsuarioResponseDTO toResponse(Usuario usuario);
}