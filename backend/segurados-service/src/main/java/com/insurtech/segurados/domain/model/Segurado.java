package com.insurtech.segurados.domain.model;

import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
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
    private Uf enderecoUf;
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

    public void atualizar(SeguradoUpdateDTO dto) {
        Optional.ofNullable(dto.nomeRazaoSocial()).ifPresent(this::setNomeRazaoSocial);
        Optional.ofNullable(dto.email()).ifPresent(this::setEmail);
        Optional.ofNullable(dto.telefone()).ifPresent(this::setTelefone);
        Optional.ofNullable(dto.dataNascimento()).ifPresent(this::setDataNascimento);
        Optional.ofNullable(dto.enderecoLogradouro()).ifPresent(this::setEnderecoLogradouro);
        Optional.ofNullable(dto.enderecoCidade()).ifPresent(this::setEnderecoCidade);
        Optional.ofNullable(dto.enderecoUf()).ifPresent(this::setEnderecoUf);
        Optional.ofNullable(dto.enderecoCep()).ifPresent(this::setEnderecoCep);
        this.updatedAt = Instant.now();
    }
}
