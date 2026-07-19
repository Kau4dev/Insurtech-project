package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.BuscarPorIdSeguradoUseCase;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
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

    @Test
    void deveRetornarSegurado_quandoExistir() {
        UUID id = UUID.randomUUID();
        Segurado segurado = new Segurado();
        segurado.setId(id);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(segurado));
        when(mapper.toResponse(segurado)).thenReturn(new SeguradoResponseDTO(
                id, null, null, null, null, null, null, null, null, null, null, null
        ));
        SeguradoResponseDTO resultado = useCase.executar(id);

        assertNotNull(resultado);
        verify(repository, times(1)).buscarPorId(id);
        verify(mapper, times(1)).toResponse(segurado);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontrado() {
        UUID id = UUID.randomUUID();
        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(id));
        verify(repository, times(1)).buscarPorId(id);
    }
}