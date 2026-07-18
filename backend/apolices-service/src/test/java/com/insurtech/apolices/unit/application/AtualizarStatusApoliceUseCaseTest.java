package com.insurtech.apolices.unit.application;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.AtualizarStatusApoliceDTO;
import com.insurtech.apolices.application.usecase.AtualizarStatusApoliceUseCase;
import com.insurtech.apolices.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.apolices.domain.exception.StatusNaoSuportadoException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static java.time.temporal.ChronoUnit.DAYS;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtualizarStatusApoliceUseCaseTest {

    @Mock
    private ApoliceRepository repository;

    @Mock
    private ApoliceMapper mapper;

    @InjectMocks
    private AtualizarStatusApoliceUseCase useCase;

    @Test
    void deveAtualizarStatusParaCancelada_comSucesso() throws StatusNaoSuportadoException {
        UUID apoliceId = UUID.randomUUID();
        AtualizarStatusApoliceDTO dto = new AtualizarStatusApoliceDTO(Status.CANCELADA);

        UUID seguradoId = UUID.randomUUID();
        Apolice apolice = mock(Apolice.class);
        ApoliceResponseDTO responseDTO = new ApoliceResponseDTO(
                apoliceId,
                seguradoId,
                "12345",
                TipoSeguro.VIDA,
                new BigDecimal("50000.00"),
                new BigDecimal("150.00"),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                Status.CANCELADA,
                Collections.emptyList(),
                Instant.now(),
                Instant.now().minus(1, DAYS)

        );

        when(repository.buscarPorId(apoliceId)).thenReturn(Optional.of(apolice));
        when(repository.salvar(apolice)).thenReturn(apolice);
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        ApoliceResponseDTO resultado = useCase.executar(apoliceId, dto);

        assertNotNull(resultado);
        assertEquals(Status.CANCELADA, resultado.status());
        verify(apolice, times(1)).cancelar();
        verify(repository, times(1)).salvar(apolice);
    }

    @Test
    void deveAtualizarStatusParaSuspensa_comSucesso() throws StatusNaoSuportadoException {
        UUID apoliceId = UUID.randomUUID();
        AtualizarStatusApoliceDTO dto = new AtualizarStatusApoliceDTO(Status.SUSPENSA);

        UUID seguradoId = UUID.randomUUID();
        Apolice apolice = mock(Apolice.class);
        ApoliceResponseDTO responseDTO = new ApoliceResponseDTO(
                apoliceId,
                seguradoId,
                "12345",
                TipoSeguro.VIDA,
                new BigDecimal("50000.00"),
                new BigDecimal("150.00"),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                Status.SUSPENSA,
                Collections.emptyList(),
                Instant.now(),
                Instant.now().minus(1, DAYS)

        );

        when(repository.buscarPorId(apoliceId)).thenReturn(Optional.of(apolice));
        when(repository.salvar(apolice)).thenReturn(apolice);
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        ApoliceResponseDTO resultado = useCase.executar(apoliceId, dto);

        assertNotNull(resultado);
        assertEquals(Status.SUSPENSA, resultado.status());
        verify(apolice, times(1)).suspender();
        verify(repository, times(1)).salvar(apolice);
    }

    @Test
    void deveAtualizarStatusParaAtiva_comSucesso() throws StatusNaoSuportadoException {
        UUID apoliceId = UUID.randomUUID();
        AtualizarStatusApoliceDTO dto = new AtualizarStatusApoliceDTO(Status.ATIVA);

        UUID seguradoId = UUID.randomUUID();
        Apolice apolice = mock(Apolice.class);
        ApoliceResponseDTO responseDTO = new ApoliceResponseDTO(
                apoliceId,
                seguradoId,
                "12345",
                TipoSeguro.VIDA,
                new BigDecimal("50000.00"),
                new BigDecimal("150.00"),
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                Status.ATIVA,
                Collections.emptyList(),
                Instant.now(),
                Instant.now().minus(1, DAYS)
        );

        when(repository.buscarPorId(apoliceId)).thenReturn(Optional.of(apolice));
        when(repository.salvar(apolice)).thenReturn(apolice);
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        ApoliceResponseDTO resultado = useCase.executar(apoliceId, dto);

        assertNotNull(resultado);
        assertEquals(Status.ATIVA, resultado.status());
        verify(apolice, times(1)).reativar();
        verify(repository, times(1)).salvar(apolice);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        UUID apoliceId = UUID.randomUUID();
        AtualizarStatusApoliceDTO dto = new AtualizarStatusApoliceDTO(Status.CANCELADA);

        when(repository.buscarPorId(apoliceId)).thenReturn(Optional.empty());

        assertThrows(ApoliceNaoEncontradaException.class, () -> useCase.executar(apoliceId, dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoStatusNaoSuportado() {
        UUID apoliceId = UUID.randomUUID();

        AtualizarStatusApoliceDTO dto = new AtualizarStatusApoliceDTO(Status.EXPIRADA);
        
        Apolice apolice = new Apolice();

        when(repository.buscarPorId(apoliceId)).thenReturn(Optional.of(apolice));

        assertThrows(StatusNaoSuportadoException.class, () -> useCase.executar(apoliceId, dto));
        verify(repository, never()).salvar(any());
    }
}
