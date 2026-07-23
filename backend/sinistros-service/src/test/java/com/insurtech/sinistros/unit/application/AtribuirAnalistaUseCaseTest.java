package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.AtribuirAnalistaUseCase;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.StatusInvalidoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtribuirAnalistaUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @InjectMocks
    private AtribuirAnalistaUseCase useCase;

    @Test
    void deveAtribuirAnalista_comSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO); // Status válido para iniciar análise

        SinistroResponseDTO responseDTO = mock(SinistroResponseDTO.class);

        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(sinistroId, analistaId);

        assertNotNull(resultado);
        assertEquals(Status.EM_ANALISE, sinistro.getStatus());
        assertEquals(analistaId, sinistro.getAnalistaId());
        
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, times(1)).salvar(sinistro);
        verify(mapper, times(1)).toResponse(sinistro);
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();

        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(sinistroId, analistaId));

        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }

    @Test
    void deveLancarExcecao_quandoStatusInvalido() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.EM_ANALISE); // Já em análise (inválido para iniciarAnálise novamente)

        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));

        assertThrows(StatusInvalidoException.class, () -> useCase.executar(sinistroId, analistaId));

        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }
}
