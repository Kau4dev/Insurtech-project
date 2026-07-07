package com.insurtech.segurados.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Segurado {

    private UUID id;
    private TipoPessoa tipoPessoa;
    private String nomeRazaoSocial;
    private String cpfCnpj;
    private String email;
    private String telefone;
    private LocalDate dataNascimento; // se tipoPessoa for PF
    private String enderecoLogradouro;
    private String enderecoCidade;
    private String enderecoUf;
    private String enderecoCep;
    private Instant createdAt;
    private Instant updatedAt;

    public boolean isPessoaFisica(){
        return TipoPessoa.PF.equals(tipoPessoa);
    }

    public void validar(){

        if (isPessoaFisica() && dataNascimento == null){
            throw new IllegalArgumentException("Data de nascimento obrigatória para Pessoa Física");
        }
        if (!isPessoaFisica() && dataNascimento != null){
            throw new IllegalArgumentException("Data de nascimento não deve ser informada para Pessoa Jurídica");
        }
    }
}
