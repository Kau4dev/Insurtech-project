package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.validation.UfValido;
import com.insurtech.segurados.domain.model.Uf;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SeguradoUpdateDTO(

        @Size(message = "Nome/Razão Social deve ter entre 2 e 255 caracteres", min = 1, max = 255)
        String nomeRazaoSocial,

        @Email(message = "Email inválido") @Size(message = "Email deve ter no máximo 255 caracteres", max = 255)
        String email,

        @Pattern(regexp = "^\\d{10,11}$", message = "Telefone deve conter apenas números, 10 ou 11 dígitos")
        String telefone,

        LocalDate dataNascimento,

        @Size(message = "Logradouro deve ter no máximo 255 caracteres", max = 255)
        String enderecoLogradouro,

        @Size(message = "Cidade deve ter no máximo 100 caracteres", max = 100)
        String enderecoCidade,

        @UfValido(message = "UF inválida")
        Uf enderecoUf,

        @Pattern(regexp = "^\\d{8}$", message = "CEP deve conter exatamente 8 dígitos numéricos")
        String enderecoCep
) {}