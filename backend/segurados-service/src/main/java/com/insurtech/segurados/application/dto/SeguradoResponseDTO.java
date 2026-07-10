package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.model.Uf;

import java.time.LocalDate;
import java.util.UUID;

public record SeguradoResponseDTO(
        UUID id,
        TipoPessoa tipoPessoa,
        String nomeRazaoSocial,
        String cpfCnpj,
        String email,
        String telefone,
        LocalDate dataNascimento,
        String enderecoLogradouro,
        String enderecoCidade,
        Uf enderecoUf,
        String enderecoCep,
        java.time.Instant createdAt
) {
}
