package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.SinistroDetalhadoResponseDTO;
import com.insurtech.sinistros.application.usecase.BuscarPorIdSinistroUseCase;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
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
class BuscarPorIdSinistroUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @InjectMocks
    private BuscarPorIdSinistroUseCase useCase;

    @Test
    void deveBuscarPorId_comSucesso() {
        UUID id = UUID.randomUUID();
        Sinistro sinistro = new Sinistro();
        SinistroDetalhadoResponseDTO responseDTO = mock(SinistroDetalhadoResponseDTO.class);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(mapper.toDetalhadoResponse(sinistro)).thenReturn(responseDTO);

        SinistroDetalhadoResponseDTO resultado = useCase.executar(id);

        assertNotNull(resultado);
        verify(repository, times(1)).buscarPorId(id);
        verify(mapper, times(1)).toDetalhadoResponse(sinistro);
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID id = UUID.randomUUID();

        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(id));
        verify(repository, times(1)).buscarPorId(id);
        verifyNoInteractions(mapper);
    }
}
