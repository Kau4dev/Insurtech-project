package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.model.TipoPessoa;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SeguradoRequestDTO(

        @NotNull
        TipoPessoa tipoPessoa,

        @NotBlank(message = "Nome/Razão Social é obrigatório")
        @Size(max = 255)
        String nomeRazaoSocial,

        @NotBlank(message = "CPF/CNPJ é obrigatório")
        @Size(min = 11, max = 14)
        @Pattern(regexp = "^\\d{11}$|^\\d{14}$", message = "CPF deve ter 11 dígitos ou CNPJ 14 dígitos numéricos")
        String cpfCnpj,

        @NotBlank(message = "Email é obrigatório")
        @Email
        @Size(max = 255)
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
) {

    @SuppressWarnings("unused")
    @AssertTrue(message = "Data de nascimento é obrigatória para PF e deve ser omitida para PJ")
    public boolean isDataNascimentoValida() {
        if (tipoPessoa == null) {
            return true;
        }

        return switch (tipoPessoa) {
            case PF -> dataNascimento != null;
            case PJ -> dataNascimento == null;
        };
    }
}
