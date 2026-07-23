package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoRequestDTO;
import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.usecase.CadastrarSeguradoUseCase;
import com.insurtech.segurados.domain.exception.CpfCnpjJaCadastradoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
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

    @Test
    void deveCadastrarSegurado_comSucesso() {
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
                LocalDate.of(1990, 5, 15), null, null, null, null, null,null
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
    void deveLancarExcecao_quandoCpfCnpjJaCadastrado() {
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