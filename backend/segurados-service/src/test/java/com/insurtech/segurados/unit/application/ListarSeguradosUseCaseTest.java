package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.PageResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.ListarSeguradosUseCase;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListarSeguradosUseCaseTest {

    @Mock
    private SeguradoRepository repository;

    @Mock
    private SeguradoMapper mapper;

    @InjectMocks
    private ListarSeguradosUseCase useCase;

    @Test
    void deveListarTodosSegurados_semFiltro_comSucesso() {
        Pageable pageable = PageRequest.of(0, 10);

        Segurado segurado1 = new Segurado();
        segurado1.setId(UUID.randomUUID());
        segurado1.setNomeRazaoSocial("João Silva");
        segurado1.setTipoPessoa(TipoPessoa.PF);

        Segurado segurado2 = new Segurado();
        segurado2.setId(UUID.randomUUID());
        segurado2.setNomeRazaoSocial("Maria Santos");
        segurado2.setTipoPessoa(TipoPessoa.PF);

        Page<Segurado> pageSegurados = new PageImpl<>(
                Arrays.asList(segurado1, segurado2),
                pageable,
                2
        );

        SeguradoResponseDTO dto1 = new SeguradoResponseDTO(
                segurado1.getId(), TipoPessoa.PF, "João Silva",
                "12345678901", "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15), null, null, null, null, null
        );
        SeguradoResponseDTO dto2 = new SeguradoResponseDTO(
                segurado2.getId(), TipoPessoa.PF, "Maria Santos",
                "98765432101", "maria@email.com", "11987654321",
                LocalDate.of(1992, 8, 20), null, null, null, null, null
        );

        when(repository.listar(null, pageable)).thenReturn(pageSegurados);
        when(mapper.toResponse(segurado1)).thenReturn(dto1);
        when(mapper.toResponse(segurado2)).thenReturn(dto2);

        PageResponseDTO<SeguradoResponseDTO> resultado = useCase.executar(null, pageable);

        assertNotNull(resultado);
        assertEquals(2, resultado.content().size());
        assertEquals("João Silva", resultado.content().get(0).nomeRazaoSocial());
        assertEquals("Maria Santos", resultado.content().get(1).nomeRazaoSocial());
        assertEquals(0, resultado.page());
        assertEquals(10, resultado.size());
        assertEquals(2, resultado.totalElements());
        assertEquals(1, resultado.totalPages());
        verify(repository, times(1)).listar(null, pageable);
        verify(mapper, times(2)).toResponse(any(Segurado.class));
    }

    @Test
    void deveListarSegurados_comFiltroNome_comSucesso() {
        Pageable pageable = PageRequest.of(0, 10);
        String nome = "João";

        Segurado segurado = new Segurado();
        segurado.setId(UUID.randomUUID());
        segurado.setNomeRazaoSocial("João Silva");
        segurado.setTipoPessoa(TipoPessoa.PF);

        Page<Segurado> pageSegurados = new PageImpl<>(
                Collections.singletonList(segurado),
                pageable,
                1
        );

        SeguradoResponseDTO dto = new SeguradoResponseDTO(
                segurado.getId(), TipoPessoa.PF, "João Silva",
                "12345678901", "joao@email.com", "11912345678",
                LocalDate.of(1990, 5, 15), null, null, null, null, null
        );

        when(repository.listar(nome, pageable)).thenReturn(pageSegurados);
        when(mapper.toResponse(segurado)).thenReturn(dto);

        PageResponseDTO<SeguradoResponseDTO> resultado = useCase.executar(nome, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.content().size());
        assertEquals("João Silva", resultado.content().get(0).nomeRazaoSocial());
        verify(repository, times(1)).listar(nome, pageable);
        verify(mapper, times(1)).toResponse(segurado);
    }

    @Test
    void deveRetornarListaVazia_quandoNaoExistemSegurados() {
        Pageable pageable = PageRequest.of(0, 10);

        Page<Segurado> pageSegurados = new PageImpl<>(
                Collections.emptyList(),
                pageable,
                0
        );

        when(repository.listar(null, pageable)).thenReturn(pageSegurados);

        PageResponseDTO<SeguradoResponseDTO> resultado = useCase.executar(null, pageable);

        assertNotNull(resultado);
        assertEquals(0, resultado.content().size());
        assertEquals(0, resultado.totalElements());
        assertEquals(0, resultado.totalPages());
        verify(repository, times(1)).listar(null, pageable);
        verify(mapper, never()).toResponse(any());
    }

    @Test
    void deveListarSegurados_comPaginacao_multiplasPaginas() {
        Pageable pageablePrimeira = PageRequest.of(0, 5);

        Segurado segurado1 = new Segurado();
        segurado1.setId(UUID.randomUUID());
        segurado1.setNomeRazaoSocial("Segurado 1");
        segurado1.setTipoPessoa(TipoPessoa.PF);

        Page<Segurado> pageSegurados = new PageImpl<>(
                Collections.singletonList(segurado1),
                pageablePrimeira,
                15
        );

        SeguradoResponseDTO dto1 = new SeguradoResponseDTO(
                segurado1.getId(), TipoPessoa.PF, "Segurado 1",
                "12345678901", "seg1@email.com", "11912345678",
                LocalDate.of(1990, 5, 15), null, null, null, null, null
        );

        when(repository.listar(null, pageablePrimeira)).thenReturn(pageSegurados);
        when(mapper.toResponse(segurado1)).thenReturn(dto1);

        PageResponseDTO<SeguradoResponseDTO> resultado = useCase.executar(null, pageablePrimeira);

        assertNotNull(resultado);
        assertEquals(1, resultado.content().size());
        assertEquals(0, resultado.page());
        assertEquals(5, resultado.size());
        assertEquals(15, resultado.totalElements());
        assertEquals(3, resultado.totalPages());
        assertFalse(resultado.last());
        verify(repository, times(1)).listar(null, pageablePrimeira);
    }

    @Test
    void deveListarSegurados_ultimaPagina() {
        Pageable pageable = PageRequest.of(2, 5);

        Segurado segurado = new Segurado();
        segurado.setId(UUID.randomUUID());
        segurado.setNomeRazaoSocial("Segurado Final");
        segurado.setTipoPessoa(TipoPessoa.PF);

        Page<Segurado> pageSegurados = new PageImpl<>(
                Collections.singletonList(segurado),
                pageable,
                15
        );

        SeguradoResponseDTO dto = new SeguradoResponseDTO(
                segurado.getId(), TipoPessoa.PF, "Segurado Final",
                "12345678901", "final@email.com", "11912345678",
                LocalDate.of(1990, 5, 15), null, null, null, null, null
        );

        when(repository.listar(null, pageable)).thenReturn(pageSegurados);
        when(mapper.toResponse(segurado)).thenReturn(dto);

        PageResponseDTO<SeguradoResponseDTO> resultado = useCase.executar(null, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.content().size());
        assertEquals(2, resultado.page());
        assertEquals(5, resultado.size());
        assertEquals(15, resultado.totalElements());
        assertEquals(3, resultado.totalPages());
        assertTrue(resultado.last());
        verify(repository, times(1)).listar(null, pageable);
    }
}