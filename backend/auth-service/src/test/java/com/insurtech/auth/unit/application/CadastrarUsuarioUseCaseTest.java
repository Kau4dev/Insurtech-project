package com.insurtech.auth.unit.application;

import com.insurtech.auth.application.dto.CadastrarUsuarioRequestDTO;
import com.insurtech.auth.application.dto.UsuarioCriadoResponseDTO;
import com.insurtech.auth.application.usecase.CadastrarUsuarioUseCase;
import com.insurtech.auth.application.validator.UsuarioSecurityValidator;
import com.insurtech.auth.domain.exception.AcessoNegadoException;
import com.insurtech.auth.domain.exception.EmailJaCadastradoException;
import com.insurtech.auth.domain.exception.SenhaInvalidaException;
import com.insurtech.auth.domain.model.Papel;
import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.domain.service.GeradorSenhaService;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CadastrarUsuarioUseCaseTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private UsuarioMapper mapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private GeradorSenhaService geradorSenhaService;

    @Mock
    private UsuarioSecurityValidator securityValidator;

    @InjectMocks
    private CadastrarUsuarioUseCase useCase;

    @Test
    void deveCadastrarSeguradoComSenhaGeradaAutomaticamente() {
        CadastrarUsuarioRequestDTO dto = new CadastrarUsuarioRequestDTO(
                "João Silva",
                "joao@email.com",
                null,
                Papel.SEGURADO
        );

        when(repository.buscarPorEmail("joao@email.com")).thenReturn(Optional.empty());
        when(geradorSenhaService.gerarSenhaSegura()).thenReturn("Temp#Pass1234");
        when(passwordEncoder.encode("Temp#Pass1234")).thenReturn("hash123");

        Usuario usuario = new Usuario();
        when(mapper.toDomain(dto)).thenReturn(usuario);
        when(repository.salvar(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioCriadoResponseDTO responseDTO = new UsuarioCriadoResponseDTO(
                UUID.randomUUID(),
                "João Silva",
                "joao@email.com",
                Papel.SEGURADO,
                true,
                "Temp#Pass1234",
                Instant.now()
        );
        when(mapper.toResponse(any(Usuario.class), eq("Temp#Pass1234"))).thenReturn(responseDTO);

        UsuarioCriadoResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertEquals("Temp#Pass1234", resultado.senhaTemporaria());
        verify(securityValidator).validarPapeisComMensagem(anyString(), eq("ADMIN"), eq("GESTOR"));
        verify(geradorSenhaService).gerarSenhaSegura();
        verify(repository).salvar(any(Usuario.class));
    }

    @Test
    void deveCadastrarGestorComSenhaFornecida() {
        CadastrarUsuarioRequestDTO dto = new CadastrarUsuarioRequestDTO(
                "Carlos Gestor",
                "carlos@email.com",
                "SenhaForte123!",
                Papel.GESTOR
        );

        when(repository.buscarPorEmail("carlos@email.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("SenhaForte123!")).thenReturn("hash456");

        Usuario usuario = new Usuario();
        when(mapper.toDomain(dto)).thenReturn(usuario);
        when(repository.salvar(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioCriadoResponseDTO responseDTO = new UsuarioCriadoResponseDTO(
                UUID.randomUUID(),
                "Carlos Gestor",
                "carlos@email.com",
                Papel.GESTOR,
                true,
                "SenhaForte123!",
                Instant.now()
        );
        when(mapper.toResponse(any(Usuario.class), eq("SenhaForte123!"))).thenReturn(responseDTO);

        UsuarioCriadoResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        verify(geradorSenhaService, never()).gerarSenhaSegura();
        verify(repository).salvar(any(Usuario.class));
    }

    @Test
    void deveLancarExcecaoQuandoTentarCriarUsuarioAdmin() {
        CadastrarUsuarioRequestDTO dto = new CadastrarUsuarioRequestDTO(
                "Novo Admin",
                "admin2@email.com",
                "SenhaAdmin123!",
                Papel.ADMIN
        );

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecaoQuandoEmailJaCadastrado() {
        CadastrarUsuarioRequestDTO dto = new CadastrarUsuarioRequestDTO(
                "Maria",
                "maria@email.com",
                null,
                Papel.SEGURADO
        );

        Usuario existente = new Usuario();
        when(repository.buscarPorEmail("maria@email.com")).thenReturn(Optional.of(existente));

        assertThrows(EmailJaCadastradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecaoQuandoSenhaInvalidaParaGestorOuAnalista() {
        CadastrarUsuarioRequestDTO dto = new CadastrarUsuarioRequestDTO(
                "Carlos",
                "carlos@email.com",
                "123", // menos de 8 caracteres
                Papel.ANALISTA
        );

        when(repository.buscarPorEmail("carlos@email.com")).thenReturn(Optional.empty());

        assertThrows(SenhaInvalidaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }
}
