package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.CadastrarSeguradoUseCase;
import com.insurtech.segurados.domain.exception.*;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.client.AuthClient;
import com.insurtech.segurados.infrastructure.client.dto.Papel;
import com.insurtech.segurados.infrastructure.client.dto.UsuarioResponseDTO;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.security.UserContext;
import com.insurtech.segurados.infrastructure.security.UserContextHolder;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CadastrarSeguradoUseCaseTest {

    @Mock
    private SeguradoRepository repository;

    @Mock
    private SeguradoMapper mapper;

    @Mock
    private AuthClient client;

    @InjectMocks
    private CadastrarSeguradoUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    private SeguradoRequestDTO criarDtoPadrao(UUID usuarioId, String cpfCnpj) {
        return new SeguradoRequestDTO(
                usuarioId,
                TipoPessoa.PF,
                "João Silva",
                cpfCnpj,
                "joao@email.com",
                "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );
    }

    @Test
    void deveCadastrarSegurado_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "12345678901");

        UsuarioResponseDTO usuarioAuth = new UsuarioResponseDTO(usuarioId, "João Silva", "joao@email.com", Papel.SEGURADO, true);
        Segurado segurado = new Segurado();
        SeguradoResponseDTO responseDTO = new SeguradoResponseDTO(
                UUID.randomUUID(), usuarioId, TipoPessoa.PF, "João Silva",
                "12345678901", "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15), null, null, null, null, null, null
        );

        when(client.buscarPorId(usuarioId)).thenReturn(usuarioAuth);
        when(repository.buscarPorUsuarioId(usuarioId)).thenReturn(Optional.empty());
        when(repository.buscarPorCpfCnpj("12345678901")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(segurado);
        when(repository.salvar(any())).thenReturn(segurado);
        when(mapper.toResponse(segurado)).thenReturn(responseDTO);

        SeguradoResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertEquals("João Silva", resultado.nomeRazaoSocial());
        verify(client, times(1)).buscarPorId(usuarioId);
        verify(repository, times(1)).buscarPorUsuarioId(usuarioId);
        verify(repository, times(1)).salvar(any());
    }

    @Test
    void deveCadastrarSegurado_comSucesso_comoAdmin() {
        setUserContext(UUID.randomUUID().toString(), "ADMIN");

        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "98765432100");

        UsuarioResponseDTO usuarioAuth = new UsuarioResponseDTO(usuarioId, "Maria", "maria@email.com", Papel.SEGURADO, true);
        Segurado segurado = new Segurado();

        when(client.buscarPorId(usuarioId)).thenReturn(usuarioAuth);
        when(repository.buscarPorUsuarioId(usuarioId)).thenReturn(Optional.empty());
        when(repository.buscarPorCpfCnpj("98765432100")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(segurado);
        when(repository.salvar(any())).thenReturn(segurado);
        when(mapper.toResponse(segurado)).thenReturn(mock(SeguradoResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(dto));
        verify(repository, times(1)).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        SeguradoRequestDTO dto = criarDtoPadrao(UUID.randomUUID(), "12345678901");

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(client, repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelAnalista() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");
        SeguradoRequestDTO dto = criarDtoPadrao(UUID.randomUUID(), "12345678901");

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(client, repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelSegurado() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");
        SeguradoRequestDTO dto = criarDtoPadrao(UUID.randomUUID(), "12345678901");

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(client, repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoEncontradoNoAuth() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");
        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "12345678901");

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound feignNotFound = new FeignException.NotFound("Not Found", request, null, null);

        when(client.buscarPorId(usuarioId)).thenThrow(feignNotFound);

        assertThrows(UsuarioNaoEncontradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoEstiverAtivo() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");
        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "12345678901");

        UsuarioResponseDTO usuarioInativo = new UsuarioResponseDTO(usuarioId, "João", "joao@email.com", Papel.SEGURADO, false);
        when(client.buscarPorId(usuarioId)).thenReturn(usuarioInativo);

        UsuarioInvalidoParaSeguradoException ex = assertThrows(
                UsuarioInvalidoParaSeguradoException.class,
                () -> useCase.executar(dto)
        );
        assertTrue(ex.getMessage().contains("não está ativo"));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoPossuirPapelSegurado() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");
        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "12345678901");

        UsuarioResponseDTO usuarioAnalista = new UsuarioResponseDTO(usuarioId, "João", "joao@email.com", Papel.ANALISTA, true);
        when(client.buscarPorId(usuarioId)).thenReturn(usuarioAnalista);

        UsuarioInvalidoParaSeguradoException ex = assertThrows(
                UsuarioInvalidoParaSeguradoException.class,
                () -> useCase.executar(dto)
        );
        assertTrue(ex.getMessage().contains("não possui papel de segurado"));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioJaPossuiSeguradoCadastrado() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");
        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "12345678901");

        UsuarioResponseDTO usuarioAuth = new UsuarioResponseDTO(usuarioId, "João", "joao@email.com", Papel.SEGURADO, true);
        when(client.buscarPorId(usuarioId)).thenReturn(usuarioAuth);
        when(repository.buscarPorUsuarioId(usuarioId)).thenReturn(Optional.of(new Segurado()));

        assertThrows(UsuarioJaCadastradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoCpfCnpjJaCadastrado() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");
        UUID usuarioId = UUID.randomUUID();
        SeguradoRequestDTO dto = criarDtoPadrao(usuarioId, "12345678901");

        UsuarioResponseDTO usuarioAuth = new UsuarioResponseDTO(usuarioId, "João", "joao@email.com", Papel.SEGURADO, true);
        when(client.buscarPorId(usuarioId)).thenReturn(usuarioAuth);
        when(repository.buscarPorUsuarioId(usuarioId)).thenReturn(Optional.empty());
        when(repository.buscarPorCpfCnpj("12345678901")).thenReturn(Optional.of(new Segurado()));

        assertThrows(CpfCnpjJaCadastradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }
}