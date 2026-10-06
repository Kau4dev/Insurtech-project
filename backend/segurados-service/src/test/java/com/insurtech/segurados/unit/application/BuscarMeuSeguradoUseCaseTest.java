package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.BuscarMeuSeguradoUseCase;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContext;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import org.junit.jupiter.api.AfterEach;
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
class BuscarMeuSeguradoUseCaseTest {

    @Mock
    private SeguradoRepository repository;

    @Mock
    private SeguradoMapper mapper;

    @InjectMocks
    private BuscarMeuSeguradoUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    @Test
    void deveRetornarSegurado_quandoUsuarioAutenticadoPossuirSegurado() {
        UUID usuarioId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "SEGURADO");

        Segurado segurado = new Segurado();
        segurado.setId(UUID.randomUUID());
        segurado.setUsuarioId(usuarioId);

        when(repository.buscarPorUsuarioId(usuarioId)).thenReturn(Optional.of(segurado));
        when(mapper.toResponse(segurado)).thenReturn(mock(SeguradoResponseDTO.class));

        SeguradoResponseDTO resultado = useCase.executar();

        assertNotNull(resultado);
        verify(repository, times(1)).buscarPorUsuarioId(usuarioId);
        verify(mapper, times(1)).toResponse(segurado);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar());
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoForSegurado() {
        UUID usuarioId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "GESTOR");

        assertThrows(AcessoNegadoException.class, () -> useCase.executar());
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontradoParaOUsuario() {
        UUID usuarioId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "SEGURADO");

        when(repository.buscarPorUsuarioId(usuarioId)).thenReturn(Optional.empty());

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar());
        verify(repository, times(1)).buscarPorUsuarioId(usuarioId);
        verify(mapper, never()).toResponse(any());
    }
}
