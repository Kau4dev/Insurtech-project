package com.insurtech.apolices.unit.application;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.usecase.BuscarPorNumeroApoliceUseCase;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BuscarPorNumeroApoliceUseCaseTest {

    @Mock
    private ApoliceRepository repository;

    @Mock
    private ApoliceMapper mapper;

    @InjectMocks
    private BuscarPorNumeroApoliceUseCase useCase;

    @Test
    void deveBuscarApolicePorNumero_comSucesso() {
        String numeroApolice = "12345";
        UUID apoliceId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();

        Apolice apolice = new Apolice();
        apolice.setId(apoliceId);
        apolice.setNumeroApolice(numeroApolice);

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
                Instant.now()
        );

        when(repository.buscarPorNumero(numeroApolice)).thenReturn(Optional.of(apolice));
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        ApoliceResponseDTO resultado = useCase.executar(numeroApolice);

        assertNotNull(resultado);
        assertEquals(numeroApolice, resultado.numeroApolice());
        verify(repository, times(1)).buscarPorNumero(numeroApolice);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        String numeroApolice = "12345";

        when(repository.buscarPorNumero(numeroApolice)).thenReturn(Optional.empty());

        assertThrows(ApoliceNaoEncontradaException.class, () -> useCase.executar(numeroApolice));
        verify(repository, times(1)).buscarPorNumero(numeroApolice);
        verify(mapper, never()).toResponse(any());
    }
}
