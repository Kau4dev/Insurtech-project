package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.validation.UfValido;
import com.insurtech.segurados.domain.model.Uf;
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

        @UfValido
        Uf enderecoUf,

        @Pattern(regexp = "^\\d{8}$", message = "CEP deve conter exatamente 8 dígitos numéricos")
        String enderecoCep
) {}