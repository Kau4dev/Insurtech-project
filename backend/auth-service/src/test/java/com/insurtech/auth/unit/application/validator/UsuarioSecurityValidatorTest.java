package com.insurtech.auth.unit.application.validator;

import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.AcessoNegadoException;
import com.insurtech.auth.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.auth.infrastructure.security.UserContext;
import com.insurtech.auth.infrastructure.security.UserContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioSecurityValidatorTest {

    private UsuarioSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UsuarioSecurityValidator();
        UserContextHolder.clear();
    }

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("Deve validar autenticação com sucesso quando usuário e papel estiverem presentes no contexto")
    void deveValidarAutenticacaoComSucesso() {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(UUID.randomUUID().toString());
        ctx.setUsuarioPapel("GESTOR");

        UserContext resultado = validator.validarAutenticacao();

        assertNotNull(resultado);
        assertEquals("GESTOR", resultado.getUsuarioPapel());
    }

    @Test
    @DisplayName("Deve lançar UsuarioNaoAutenticadoException quando o contexto do usuário não estiver autenticado")
    void deveLancarExcecaoQuandoNaoAutenticado() {
        assertThrows(UsuarioNaoAutenticadoException.class, () -> validator.validarAutenticacao());
    }

    @Test
    @DisplayName("Deve validar papéis com sucesso para perfil ADMIN ou GESTOR")
    void deveValidarPapeisComSucessoParaAdminOuGestor() {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(UUID.randomUUID().toString());
        ctx.setUsuarioPapel("ADMIN");

        assertDoesNotThrow(() -> validator.validarPapeis("ADMIN", "GESTOR"));
    }

    @Test
    @DisplayName("Deve lançar AcessoNegadoException quando o papel do usuário não for permitido")
    void deveLancarExcecaoQuandoPapelNaoPermitido() {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(UUID.randomUUID().toString());
        ctx.setUsuarioPapel("ANALISTA");

        assertThrows(AcessoNegadoException.class, () -> validator.validarPapeis("ADMIN", "GESTOR"));
    }
}
