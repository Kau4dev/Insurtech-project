package com.insurtech.segurados.infrastructure.persistence;

import com.insurtech.segurados.domain.model.TipoPessoa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "segurados")
@Getter @Setter
@NoArgsConstructor
public class SeguradoJpaEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", nullable = false)
    private TipoPessoa tipoPessoa;

    @Column(name = "nome_razao_social", nullable = false)
    private String nomeRazaoSocial;

    @Column(name = "cpf_cnpj", nullable = false, unique = true)
    private String cpfCnpj;

    @Column(nullable = false)
    private String email;

    private String telefone;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "endereco_logradouro")
    private String enderecoLogradouro;

    @Column(name = "endereco_cidade")
    private String enderecoCidade;

    @Column(name = "endereco_uf")
    private String enderecoUf;

    @Column(name = "endereco_cep")
    private String enderecoCep;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

}
