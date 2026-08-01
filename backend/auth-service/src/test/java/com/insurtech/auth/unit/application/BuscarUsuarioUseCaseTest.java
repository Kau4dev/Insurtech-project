package com.insurtech.auth.unit.application;

import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.application.usecase.BuscarUsuarioUseCase;
import com.insurtech.auth.domain.exception.TokenInvalidoException;
import com.insurtech.auth.domain.exception.UsuarioNaoEncontradoException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import com.insurtech.auth.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BuscarUsuarioUseCaseTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private JwtService jwtService;

    @Mock
    private UsuarioMapper mapper;

    @InjectMocks
    private BuscarUsuarioUseCase buscarUsuarioUseCase;

    @Test
    void deveBuscarUsuarioPorToken_comSucesso() {
        String token = "valid-jwt-token";
        UUID userId = UUID.randomUUID();
        
        Usuario usuario = new Usuario();
        usuario.setId(userId);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setPapel(Papel.ANALISTA);
        usuario.setAtivo(true);

        UsuarioResponseDTO responseDTO = new UsuarioResponseDTO(userId, "João Silva", "joao@email.com", Papel.ANALISTA);

        when(jwtService.isTokenValido(token)).thenReturn(true);
        when(jwtService.extrairUsuarioId(token)).thenReturn(userId);
        when(repository.buscarPorId(userId)).thenReturn(Optional.of(usuario));
        when(mapper.toResponse(usuario)).thenReturn(responseDTO);

        UsuarioResponseDTO response = buscarUsuarioUseCase.executarPorToken(token);

        assertNotNull(response);
        assertEquals(userId, response.id());
        assertEquals("João Silva", response.nome());
        assertEquals("joao@email.com", response.email());
        assertEquals(Papel.ANALISTA, response.papel());

        verify(jwtService, times(1)).isTokenValido(token);
        verify(jwtService, times(1)).extrairUsuarioId(token);
        verify(repository, times(1)).buscarPorId(userId);
        verify(mapper, times(1)).toResponse(usuario);
    }

    @Test
    void deveLancarExcecao_quandoTokenInvalido() {
        String token = "invalid-jwt-token";

        when(jwtService.isTokenValido(token)).thenReturn(false);

        assertThrows(TokenInvalidoException.class, () -> buscarUsuarioUseCase.executarPorToken(token));

        verify(jwtService, times(1)).isTokenValido(token);
        verify(jwtService, never()).extrairUsuarioId(anyString());
        verify(repository, never()).buscarPorId(any());
        verifyNoInteractions(mapper);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoEncontrado() {
        String token = "valid-jwt-token-but-no-user";
        UUID userId = UUID.randomUUID();

        when(jwtService.isTokenValido(token)).thenReturn(true);
        when(jwtService.extrairUsuarioId(token)).thenReturn(userId);
        when(repository.buscarPorId(userId)).thenReturn(Optional.empty());

        assertThrows(UsuarioNaoEncontradoException.class, () -> buscarUsuarioUseCase.executarPorToken(token));

        verify(jwtService, times(1)).isTokenValido(token);
        verify(jwtService, times(1)).extrairUsuarioId(token);
        verify(repository, times(1)).buscarPorId(userId);
        verifyNoInteractions(mapper);
    }

    @Test
    void deveBuscarUsuarioPorId_comSucesso() {
        UUID userId = UUID.randomUUID();

        Usuario usuario = new Usuario();
        usuario.setId(userId);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setPapel(Papel.ANALISTA);
        usuario.setAtivo(true);

        UsuarioResponseDTO responseDTO = new UsuarioResponseDTO(userId, "João Silva", "joao@email.com", Papel.ANALISTA);

        when(repository.buscarPorId(userId)).thenReturn(Optional.of(usuario));
        when(mapper.toResponse(usuario)).thenReturn(responseDTO);

        UsuarioResponseDTO response = buscarUsuarioUseCase.executarPorId(userId);

        assertNotNull(response);
        assertEquals(userId, response.id());
        assertEquals("João Silva", response.nome());
        assertEquals("joao@email.com", response.email());
        assertEquals(Papel.ANALISTA, response.papel());

        verify(repository, times(1)).buscarPorId(userId);
        verify(mapper, times(1)).toResponse(usuario);
        verifyNoInteractions(jwtService);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoEncontradoPorId() {
        UUID userId = UUID.randomUUID();

        when(repository.buscarPorId(userId)).thenReturn(Optional.empty());

        assertThrows(UsuarioNaoEncontradoException.class, () -> buscarUsuarioUseCase.executarPorId(userId));

        verify(repository, times(1)).buscarPorId(userId);
        verifyNoInteractions(mapper);
        verifyNoInteractions(jwtService);
    }
}
