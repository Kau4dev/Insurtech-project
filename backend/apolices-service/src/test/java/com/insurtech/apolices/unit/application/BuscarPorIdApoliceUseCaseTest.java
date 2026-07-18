package com.insurtech.apolices.unit.application;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.usecase.BuscarPorIdApoliceUseCase;
import com.insurtech.apolices.domain.exception.ApoliceNaoEncontradaException;
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
class BuscarPorIdApoliceUseCaseTest {

    @Mock
    private ApoliceRepository repository;

    @Mock
    private ApoliceMapper mapper;

    @InjectMocks
    private BuscarPorIdApoliceUseCase useCase;

    @Test
    void deveBuscarApolicePorId_comSucesso() {
        UUID apoliceId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();

        Apolice apolice = new Apolice();
        apolice.setId(apoliceId);

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
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        ApoliceResponseDTO resultado = useCase.executar(apoliceId);

        assertNotNull(resultado);
        assertEquals(apoliceId, resultado.id());
        verify(repository, times(1)).buscarPorId(apoliceId);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        UUID apoliceId = UUID.randomUUID();

        when(repository.buscarPorId(apoliceId)).thenReturn(Optional.empty());

        assertThrows(ApoliceNaoEncontradaException.class, () -> useCase.executar(apoliceId));
        verify(repository, times(1)).buscarPorId(apoliceId);
        verify(mapper, never()).toResponse(any());
    }
}
