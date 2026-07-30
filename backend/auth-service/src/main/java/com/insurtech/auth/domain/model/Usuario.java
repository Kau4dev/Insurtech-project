package com.insurtech.auth.domain.model;


import com.insurtech.auth.domain.exception.EmailObrigatorioException;
import com.insurtech.auth.domain.exception.NomeObrigatorioException;
import com.insurtech.auth.domain.exception.UsuarioInativoException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    private UUID id;
    private String nome;
    private String email;
    private String senhaHash;
    private Papel papel;
    private Boolean ativo;
    private Instant createdAt;

    public void validar() {
        if (nome == null || nome.isBlank()) {
            throw new NomeObrigatorioException("Nome é obrigatório");
        }
        if (email == null || email.isBlank()) {
            throw new EmailObrigatorioException("Email é obrigatório");
        }
        if (!ativo) {
            throw new UsuarioInativoException("Usuário inativo não pode realizar operações");
        }
    }
}
