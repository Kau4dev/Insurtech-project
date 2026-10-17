package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.BuscarPorIdSeguradoUseCase;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContext;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
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
class BuscarPorIdSeguradoUseCaseTest {

    @Mock
    private SeguradoRepository repository;

    @Mock
    private SeguradoMapper mapper;

    @InjectMocks
    private BuscarPorIdSeguradoUseCase useCase;

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
    @DisplayName("Deve retornar segurado por ID com sucesso quando usuário possuir papel GESTOR")
    void deveRetornarSegurado_quandoExistir_comoGestor() {
        UUID id = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        Segurado segurado = new Segurado();
        segurado.setId(id);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(segurado));
        when(mapper.toResponse(segurado)).thenReturn(mock(SeguradoResponseDTO.class));

        SeguradoResponseDTO resultado = useCase.executar(id);

        assertNotNull(resultado);
        verify(repository, times(1)).buscarPorId(id);
        verify(mapper, times(1)).toResponse(segurado);
    }

    @Test
    @DisplayName("Deve retornar segurado por ID quando o próprio segurado autenticado consultar seu cadastro")
    void deveRetornarSegurado_quandoSeguradoBuscaASiMesmo() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        setUserContext(usuarioId.toString(), "SEGURADO");

        Segurado segurado = new Segurado();
        segurado.setId(id);
        segurado.setUsuarioId(usuarioId);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(segurado));
        when(mapper.toResponse(segurado)).thenReturn(mock(SeguradoResponseDTO.class));

        SeguradoResponseDTO resultado = useCase.executar(id);

        assertNotNull(resultado);
        verify(repository, times(1)).buscarPorId(id);
        verify(mapper, times(1)).toResponse(segurado);
    }

    @Test
    @DisplayName("Deve lançar exceção de acesso negado quando segurado tentar buscar cadastro de outro segurado")
    void deveLancarExcecao_quandoSeguradoBuscaOutroSegurado() {
        UUID id = UUID.randomUUID();
        UUID usuarioLogadoId = UUID.randomUUID();
        UUID donoDoSeguradoId = UUID.randomUUID();
        setUserContext(usuarioLogadoId.toString(), "SEGURADO");

        Segurado segurado = new Segurado();
        segurado.setId(id);
        segurado.setUsuarioId(donoDoSeguradoId);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(segurado));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(id));
        verify(repository, times(1)).buscarPorId(id);
        verify(mapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Deve lançar exceção de acesso negado quando segurado tentar acessar cadastro sem usuário vinculado")
    void deveLancarExcecao_quandoSeguradoNaoPossuiUsuarioIdVinculado_eSeguradoTentaAcessar() {
        UUID id = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        Segurado segurado = new Segurado();
        segurado.setId(id);
        segurado.setUsuarioId(null);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(segurado));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(id));
        verify(repository, times(1)).buscarPorId(id);
        verify(mapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar buscar segurado por ID sem usuário autenticado")
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        UUID id = UUID.randomUUID();

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(id));
        verifyNoInteractions(repository, mapper);
    }

    @Test
    @DisplayName("Deve lançar exceção quando o segurado não for encontrado pelo ID")
    void deveLancarExcecao_quandoSeguradoNaoEncontrado() {
        UUID id = UUID.randomUUID();
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(id));
        verify(repository, times(1)).buscarPorId(id);
    }
}