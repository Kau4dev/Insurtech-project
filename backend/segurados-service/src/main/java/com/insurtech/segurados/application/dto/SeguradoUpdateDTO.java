package com.insurtech.segurados.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record SeguradoUpdateDTO(
        @NotBlank String nomeRazaoSocial,
        @NotBlank @Email String email,
        String telefone,
        LocalDate dataNascimento,
        String enderecoLogradouro,
        String enderecoCidade,
        String enderecoUf,
        String enderecoCep
) {}