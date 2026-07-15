package com.insurtech.apolices.infrastructure.client.dto;

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
