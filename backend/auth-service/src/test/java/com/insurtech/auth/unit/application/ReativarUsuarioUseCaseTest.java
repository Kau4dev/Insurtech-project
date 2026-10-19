package com.insurtech.auth.unit.application;

import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.application.usecase.ReativarUsuarioUseCase;
import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.UsuarioNaoEncontradoException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import org.junit.jupiter.api.DisplayName;
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
class ReativarUsuarioUseCaseTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private UsuarioMapper mapper;

    @Mock
    private UsuarioSecurityValidator securityValidator;

    @InjectMocks
    private ReativarUsuarioUseCase useCase;

    @Test
    @DisplayName("Deve reativar usuário com sucesso")
    void deveAtivarUsuarioComSucesso() {
        UUID id = UUID.randomUUID();
        Usuario inativo = new Usuario();
        inativo.setId(id);
        inativo.setNome("Usuario Inativo");
        inativo.setAtivo(false);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(inativo));
        when(repository.salvar(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioResponseDTO responseDTO = new UsuarioResponseDTO(id, "Usuario Inativo", "inativo@email.com", Papel.ANALISTA, true);
        when(mapper.toResponse(any(Usuario.class))).thenReturn(responseDTO);

        UsuarioResponseDTO resultado = useCase.executar(id);

        assertNotNull(resultado);
        assertTrue(inativo.getAtivo());
        assertNotNull(inativo.getUpdatedAt());
        verify(securityValidator).validarPapeisComMensagem(anyString(), eq("ADMIN"), eq("GESTOR"));
        verify(repository).salvar(inativo);
    }

    @Test
    @DisplayName("Deve lançar IllegalStateException quando o usuário já estiver ativo")
    void deveLancarExcecaoQuandoUsuarioJaEstiverAtivo() {
        UUID id = UUID.randomUUID();
        Usuario ativo = new Usuario();
        ativo.setId(id);
        ativo.setAtivo(true);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(ativo));

        assertThrows(IllegalStateException.class, () -> useCase.executar(id));
        verify(repository, never()).salvar(any());
    }

    @Test
    @DisplayName("Deve lançar UsuarioNaoEncontradoException quando o usuário não for encontrado")
    void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
        UUID id = UUID.randomUUID();
        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(UsuarioNaoEncontradoException.class, () -> useCase.executar(id));
        verify(repository, never()).salvar(any());
    }
}

