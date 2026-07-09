package com.insurtech.segurados.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SeguradoUpdateDTO(
        @Size(min = 1, max = 255)
        String nomeRazaoSocial,

        @Email @Size(max = 255)
        String email,

        @Pattern(regexp = "^\\d{10,11}$", message = "Telefone deve conter apenas números, 10 ou 11 dígitos")
        String telefone,

        LocalDate dataNascimento,

        @Size(max = 255)
        String enderecoLogradouro,

        @Size(max = 100)
        String enderecoCidade,

        @Pattern(regexp = "^[A-Z]{2}$", message = "UF deve conter 2 letras maiúsculas")
        String enderecoUf,

        @Pattern(regexp = "^\\d{8}$", message = "CEP deve conter exatamente 8 dígitos numéricos")
        String enderecoCep
) {}