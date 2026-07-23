package com.insurtech.sinistros.infrastructure.client.dto;

import java.time.Instant;
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
        Instant createdAt
) {
}
