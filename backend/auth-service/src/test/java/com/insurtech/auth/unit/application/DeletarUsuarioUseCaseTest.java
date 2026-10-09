package com.insurtech.auth.unit.application;

import com.insurtech.auth.application.usecase.DeletarUsuarioUseCase;
import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.AcessoNegadoException;
import com.insurtech.auth.domain.exception.UsuarioNaoEncontradoException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeletarUsuarioUseCaseTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private UsuarioSecurityValidator securityValidator;

    @InjectMocks
    private DeletarUsuarioUseCase useCase;

    @Test
    void deveInativarUsuarioComSucesso() {
        UUID id = UUID.randomUUID();
        Usuario ativo = new Usuario();
        ativo.setId(id);
        ativo.setAtivo(true);
        ativo.setPapel(Papel.ANALISTA);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(ativo));

        useCase.executar(id);

        assertFalse(ativo.getAtivo());
        verify(securityValidator).validarPapeisComMensagem(anyString(), eq("ADMIN"), eq("GESTOR"));
        verify(repository).salvar(ativo);
    }

    @Test
    void deveLancarExcecaoAoTentarInativarUsuarioAdmin() {
        UUID id = UUID.randomUUID();
        Usuario admin = new Usuario();
        admin.setId(id);
        admin.setAtivo(true);
        admin.setPapel(Papel.ADMIN);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(admin));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(id));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioJaEstiverInativo() {
        UUID id = UUID.randomUUID();
        Usuario inativo = new Usuario();
        inativo.setId(id);
        inativo.setAtivo(false);
        inativo.setPapel(Papel.SEGURADO);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(inativo));

        assertThrows(IllegalStateException.class, () -> useCase.executar(id));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
        UUID id = UUID.randomUUID();
        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(UsuarioNaoEncontradoException.class, () -> useCase.executar(id));
        verify(repository, never()).salvar(any());
    }
}
