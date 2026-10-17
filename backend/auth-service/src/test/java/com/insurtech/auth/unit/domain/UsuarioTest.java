package com.insurtech.auth.unit.domain;

import com.insurtech.auth.domain.exception.EmailObrigatorioException;
import com.insurtech.auth.domain.exception.NomeObrigatorioException;
import com.insurtech.auth.domain.exception.UsuarioInativoException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioTest {

    @Test
    @DisplayName("Deve validar usuário com sucesso quando todos os campos obrigatórios estiverem preenchidos e usuário ativo")
    void deveValidarUsuario_comSucesso() {
        Usuario usuario = new Usuario();
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setAtivo(true);
        usuario.setPapel(Papel.ANALISTA);

        assertDoesNotThrow(usuario::validar);
    }

    @Test
    @DisplayName("Deve lançar NomeObrigatorioException quando o nome for nulo")
    void deveLancarExcecao_quandoNomeNulo() {
        Usuario usuario = new Usuario();
        usuario.setNome(null);
        usuario.setEmail("joao@email.com");
        usuario.setAtivo(true);

        assertThrows(NomeObrigatorioException.class, usuario::validar);
    }

    @Test
    @DisplayName("Deve lançar NomeObrigatorioException quando o nome estiver em branco")
    void deveLancarExcecao_quandoNomeVazio() {
        Usuario usuario = new Usuario();
        usuario.setNome("   ");
        usuario.setEmail("joao@email.com");
        usuario.setAtivo(true);

        assertThrows(NomeObrigatorioException.class, usuario::validar);
    }

    @Test
    @DisplayName("Deve lançar EmailObrigatorioException quando o e-mail for nulo")
    void deveLancarExcecao_quandoEmailNulo() {
        Usuario usuario = new Usuario();
        usuario.setNome("João Silva");
        usuario.setEmail(null);
        usuario.setAtivo(true);

        assertThrows(EmailObrigatorioException.class, usuario::validar);
    }

    @Test
    @DisplayName("Deve lançar EmailObrigatorioException quando o e-mail estiver em branco")
    void deveLancarExcecao_quandoEmailVazio() {
        Usuario usuario = new Usuario();
        usuario.setNome("João Silva");
        usuario.setEmail("");
        usuario.setAtivo(true);

        assertThrows(EmailObrigatorioException.class, usuario::validar);
    }

    @Test
    @DisplayName("Deve lançar UsuarioInativoException ao validar usuário inativo")
    void deveLancarExcecao_quandoUsuarioInativo() {
        Usuario usuario = new Usuario();
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setAtivo(false);

        assertThrows(UsuarioInativoException.class, usuario::validar);
    }
}
