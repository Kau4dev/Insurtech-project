package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.CadastrarSeguradoUseCase;
import com.insurtech.segurados.domain.exception.AcessoNegadoException;
import com.insurtech.segurados.domain.exception.CpfCnpjJaCadastradoException;
import com.insurtech.segurados.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.model.TipoPessoa;
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

import java.time.LocalDate;
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

    @Test
    void deveCadastrarSegurado_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        Segurado segurado = new Segurado();
        SeguradoResponseDTO responseDTO = new SeguradoResponseDTO(
                UUID.randomUUID(), TipoPessoa.PF, "João Silva",
                "12345678901", "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15), null, null, null, null, null, null
        );

        when(repository.buscarPorCpfCnpj("12345678901")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(segurado);
        when(repository.salvar(any())).thenReturn(segurado);
        when(mapper.toResponse(segurado)).thenReturn(responseDTO);

        SeguradoResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertEquals("João Silva", resultado.nomeRazaoSocial());
        verify(repository, times(1)).salvar(any());
    }

    @Test
    void deveCadastrarSegurado_comSucesso_comoAdmin() {
        setUserContext(UUID.randomUUID().toString(), "ADMIN");

        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "Maria", "98765432100",
                "maria@email.com", "11987654321",
                LocalDate.of(1985, 3, 10),
                null, null, null, null
        );

        Segurado segurado = new Segurado();
        when(repository.buscarPorCpfCnpj("98765432100")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(segurado);
        when(repository.salvar(any())).thenReturn(segurado);
        when(mapper.toResponse(segurado)).thenReturn(mock(SeguradoResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(dto));
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", null, LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelAnalista() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", null, LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelSegurado() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", null, LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, mapper);
    }

    @Test
    void deveLancarExcecao_quandoCpfCnpjJaCadastrado() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        SeguradoRequestDTO dto = new SeguradoRequestDTO(
                TipoPessoa.PF, "João Silva", "12345678901",
                "joao@email.com", null, LocalDate.of(1990, 5, 15),
                null, null, null, null
        );

        when(repository.buscarPorCpfCnpj("12345678901"))
                .thenReturn(Optional.of(new Segurado()));

        assertThrows(CpfCnpjJaCadastradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }
}