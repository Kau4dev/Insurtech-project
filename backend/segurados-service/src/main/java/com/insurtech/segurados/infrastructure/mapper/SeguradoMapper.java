package com.insurtech.segurados.infrastructure.mapper;

import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.infrastructure.persistence.SeguradoJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class SeguradoMapper {

    public Segurado toDomain(SeguradoRequestDTO dto) {
        Segurado segurado = new Segurado();
        segurado.setTipoPessoa(dto.tipoPessoa());
        segurado.setNomeRazaoSocial(dto.nomeRazaoSocial());
        segurado.setCpfCnpj(dto.cpfCnpj());
        segurado.setEmail(dto.email());
        segurado.setTelefone(dto.telefone());
        segurado.setDataNascimento(dto.dataNascimento());
        segurado.setEnderecoLogradouro(dto.enderecoLogradouro());
        segurado.setEnderecoCidade(dto.enderecoCidade());
        segurado.setEnderecoUf(dto.enderecoUf());
        segurado.setEnderecoCep(dto.enderecoCep());
        return segurado;
    }

    public SeguradoJpaEntity toEntity(Segurado segurado) {
        SeguradoJpaEntity entity = new SeguradoJpaEntity();
        entity.setId(segurado.getId());
        entity.setTipoPessoa(segurado.getTipoPessoa());
        entity.setNomeRazaoSocial(segurado.getNomeRazaoSocial());
        entity.setCpfCnpj(segurado.getCpfCnpj());
        entity.setEmail(segurado.getEmail());
        entity.setTelefone(segurado.getTelefone());
        entity.setDataNascimento(segurado.getDataNascimento());
        entity.setEnderecoLogradouro(segurado.getEnderecoLogradouro());
        entity.setEnderecoCidade(segurado.getEnderecoCidade());
        entity.setEnderecoUf(segurado.getEnderecoUf());
        entity.setEnderecoCep(segurado.getEnderecoCep());
        entity.setCreatedAt(segurado.getCreatedAt());
        entity.setUpdatedAt(segurado.getUpdatedAt());
        return entity;
    }

    public Segurado toDomain(SeguradoJpaEntity entity) {
        Segurado segurado = new Segurado();
        segurado.setId(entity.getId());
        segurado.setTipoPessoa(entity.getTipoPessoa());
        segurado.setNomeRazaoSocial(entity.getNomeRazaoSocial());
        segurado.setCpfCnpj(entity.getCpfCnpj());
        segurado.setEmail(entity.getEmail());
        segurado.setTelefone(entity.getTelefone());
        segurado.setDataNascimento(entity.getDataNascimento());
        segurado.setEnderecoLogradouro(entity.getEnderecoLogradouro());
        segurado.setEnderecoCidade(entity.getEnderecoCidade());
        segurado.setEnderecoUf(entity.getEnderecoUf());
        segurado.setEnderecoCep(entity.getEnderecoCep());
        segurado.setCreatedAt(entity.getCreatedAt());
        segurado.setUpdatedAt(entity.getUpdatedAt());
        return segurado;
    }

    public SeguradoResponseDTO toResponse(Segurado segurado) {
        return new SeguradoResponseDTO(
                segurado.getId(),
                segurado.getTipoPessoa(),
                segurado.getNomeRazaoSocial(),
                segurado.getCpfCnpj(),
                segurado.getEmail(),
                segurado.getTelefone(),
                segurado.getDataNascimento(),
                segurado.getEnderecoLogradouro(),
                segurado.getEnderecoCidade(),
                segurado.getEnderecoUf(),
                segurado.getEnderecoCep(),
                segurado.getCreatedAt()
        );
    }
}
