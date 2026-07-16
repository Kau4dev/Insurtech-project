package com.insurtech.segurados.application.dto;

import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.model.Uf;
import com.insurtech.segurados.domain.validation.UfValido;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SeguradoRequestDTO(

        @NotNull(message = "Tipo de pessoa é obrigatório")
        TipoPessoa tipoPessoa,

        @NotBlank(message = "Nome/Razão Social é obrigatório")
        @Size(message = "Nome/Razão Social deve ter entre 2 e 255 caracteres", max = 255)
        String nomeRazaoSocial,

        @NotBlank(message = "CPF/CNPJ é obrigatório")
        @Size(message = "CPF/CNPJ deve ter entre 11 e 14 caracteres", min = 11, max = 14)
        @Pattern(regexp = "^\\d{11}$|^\\d{14}$", message = "CPF deve ter 11 dígitos ou CNPJ 14 dígitos numéricos")
        String cpfCnpj,

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email inválido")
        @Size(message = "Email deve ter no máximo 255 caracteres", max = 255)
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
