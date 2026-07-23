package com.insurtech.apolices.unit.application;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.PageResponseDTO;
import com.insurtech.apolices.application.usecase.ListarApolicesUseCase;
import com.insurtech.apolices.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import com.insurtech.apolices.infrastructure.client.SeguradoClient;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static java.time.temporal.ChronoUnit.DAYS;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListarApolicesUseCaseTest {

    @Mock
    private ApoliceRepository repository;

    @Mock
    private ApoliceMapper mapper;

    @Mock
    private SeguradoClient client;

    @InjectMocks
    private ListarApolicesUseCase useCase;

    @Test
    void deveListarApolices_comSucesso() {
        UUID seguradoId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Apolice apolice = new Apolice();
        UUID apoliceId = UUID.randomUUID();

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

        Page<Apolice> page = new PageImpl<>(List.of(apolice));

        when(client.buscarPorId(seguradoId)).thenReturn(null);
        when(repository.listar(seguradoId, null, null, pageable)).thenReturn(page);
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        PageResponseDTO<ApoliceResponseDTO> resultado = useCase.executar(seguradoId, null, null, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
        verify(repository, times(1)).listar(seguradoId, null, null, pageable);
    }

    @Test
    void deveListarApolices_semFiltroSegurado_comSucesso() {
        Pageable pageable = PageRequest.of(0, 10);
        UUID seguradoId = UUID.randomUUID();
        Apolice apolice = new Apolice();
        UUID apoliceId = UUID.randomUUID();

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

        Page<Apolice> page = new PageImpl<>(List.of(apolice));

        when(repository.listar(null, null, null, pageable)).thenReturn(page);
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        PageResponseDTO<ApoliceResponseDTO> resultado = useCase.executar(null, null, null, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.totalElements());
        verify(repository, times(1)).listar(null, null, null, pageable);
        verify(client, never()).buscarPorId(any());
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontrado_aoListar() {
        UUID seguradoId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(client.buscarPorId(seguradoId)).thenThrow(exception);

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(seguradoId, null, null, pageable));
        verify(repository, never()).listar(any(), any(), any(), any());
    }
}
