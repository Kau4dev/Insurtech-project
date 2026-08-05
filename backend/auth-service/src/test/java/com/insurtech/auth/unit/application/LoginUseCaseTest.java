package com.insurtech.auth.unit.application;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.LoginResponseDTO;
import com.insurtech.auth.application.usecase.LoginUseCase;
import com.insurtech.auth.domain.exception.EmailNaoEncontradoException;
import com.insurtech.auth.domain.exception.SenhaIncorretaException;
import com.insurtech.auth.domain.exception.UsuarioInativoException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginUseCaseTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private LoginUseCase loginUseCase;

    @Test
    void deveRealizarLogin_comSucesso() {
        LoginRequestDTO dto = new LoginRequestDTO("test@email.com", "password123");
        
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNome("Test User");
        usuario.setEmail("test@email.com");
        usuario.setSenhaHash("hashedPassword");
        usuario.setPapel(Papel.ADMIN);
        usuario.setAtivo(true);

        when(repository.buscarPorEmail(dto.email())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(dto.senha(), usuario.getSenhaHash())).thenReturn(true);
        when(jwtService.gerarToken(usuario)).thenReturn("mocked-jwt-token");

        LoginResponseDTO response = loginUseCase.executar(dto);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.token());
        assertEquals("Bearer", response.tipo());
        assertEquals(3600L, response.expiresIn());
        assertEquals(Papel.ADMIN, response.papel());

        verify(repository, times(1)).buscarPorEmail(dto.email());
        verify(passwordEncoder, times(1)).matches(dto.senha(), usuario.getSenhaHash());
        verify(jwtService, times(1)).gerarToken(usuario);
    }

    @Test
    void deveLancarExcecao_quandoEmailNaoEncontrado() {
        LoginRequestDTO dto = new LoginRequestDTO("nonexistent@email.com", "password123");

        when(repository.buscarPorEmail(dto.email())).thenReturn(Optional.empty());

        assertThrows(EmailNaoEncontradoException.class, () -> loginUseCase.executar(dto));

        verify(repository, times(1)).buscarPorEmail(dto.email());
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioInativo() {
        LoginRequestDTO dto = new LoginRequestDTO("inactive@email.com", "password123");

        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNome("Inactive User");
        usuario.setEmail("inactive@email.com");
        usuario.setSenhaHash("hashedPassword");
        usuario.setPapel(Papel.ANALISTA);
        usuario.setAtivo(false); // Inativo

        when(repository.buscarPorEmail(dto.email())).thenReturn(Optional.of(usuario));

        assertThrows(UsuarioInativoException.class, () -> loginUseCase.executar(dto));

        verify(repository, times(1)).buscarPorEmail(dto.email());
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void deveLancarExcecao_quandoSenhaIncorreta() {
        LoginRequestDTO dto = new LoginRequestDTO("test@email.com", "wrongPassword");

        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNome("Test User");
        usuario.setEmail("test@email.com");
        usuario.setSenhaHash("hashedPassword");
        usuario.setPapel(Papel.GESTOR);
        usuario.setAtivo(true);

        when(repository.buscarPorEmail(dto.email())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(dto.senha(), usuario.getSenhaHash())).thenReturn(false);

        assertThrows(SenhaIncorretaException.class, () -> loginUseCase.executar(dto));

        verify(repository, times(1)).buscarPorEmail(dto.email());
        verify(passwordEncoder, times(1)).matches(dto.senha(), usuario.getSenhaHash());
        verifyNoInteractions(jwtService);
    }
}
