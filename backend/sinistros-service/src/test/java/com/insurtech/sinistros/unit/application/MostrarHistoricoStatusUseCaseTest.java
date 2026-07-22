package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.HistoricoSinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.MostrarHistoricoStatusUseCase;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.HistoricoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MostrarHistoricoStatusUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @InjectMocks
    private MostrarHistoricoStatusUseCase useCase;

    @Test
    void deveMostrarHistorico_comSucesso() {
        UUID id = UUID.randomUUID();
        Sinistro sinistro = new Sinistro();
        HistoricoSinistro historico = new HistoricoSinistro();
        sinistro.getHistorico().add(historico);
        
        HistoricoSinistroResponseDTO historicoDTO = mock(HistoricoSinistroResponseDTO.class);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(mapper.toResponse(any(HistoricoSinistro.class))).thenReturn(historicoDTO);

        List<HistoricoSinistroResponseDTO> resultado = useCase.executar(id);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(repository, times(1)).buscarPorId(id);
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
