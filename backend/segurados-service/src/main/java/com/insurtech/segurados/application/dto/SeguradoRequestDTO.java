package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.model.TipoPessoa;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SeguradoRequestDTO(
        @NotNull TipoPessoa tipoPessoa,
        @NotBlank String nomeRazaoSocial,
        @NotBlank String cpfCnpj,
        @Email @NotBlank String email,
        String telefone,
        LocalDate dataNascimento,
        String enderecoLogradouro,
        String enderecoCidade,
        String enderecoUf,
        String enderecoCep
) {
}
