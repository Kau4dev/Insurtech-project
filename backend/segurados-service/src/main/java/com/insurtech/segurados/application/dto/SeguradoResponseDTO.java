package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.model.TipoPessoa;

import java.util.UUID;

public record SeguradoResponseDTO(
        UUID id,
        TipoPessoa tipoPessoa,
        String nomeRazaoSocial,
        String cpfCnpj,
        String email,
        String telefone,
        java.time.LocalDate dataNascimento,
        String enderecoLogradouro,
        String enderecoCidade,
        String enderecoUf,
        String enderecoCep,
        java.time.Instant createdAt
) {
}
