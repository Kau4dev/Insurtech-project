package com.insurtech.segurados.unit.application;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.application.usecase.AtualizarSeguradoUseCase;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.model.TipoPessoa;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtualizarSeguradoUseCaseTest {

	@Mock
	private SeguradoRepository repository;

	@Mock
	private SeguradoMapper mapper;

	@InjectMocks
	private AtualizarSeguradoUseCase useCase;

	@Test
	void deveAtualizarSegurado_comSucesso() {
		UUID id = UUID.randomUUID();
		Segurado segurado = new Segurado();
		segurado.setId(id);
		segurado.setTipoPessoa(TipoPessoa.PF);
		Segurado updatedSegurado = new Segurado();

		SeguradoUpdateDTO dto = new SeguradoUpdateDTO(
				"Nome Atualizado",
				"email@exemplo.com",
				"11912345678",
				LocalDate.of(1990, 5, 15),
				"Rua A, 123",
				"Cidade",
				"SP",
				"01001000"
		);

		SeguradoResponseDTO responseDTO = new SeguradoResponseDTO(
				id, TipoPessoa.PF, "Nome Atualizado", "12345678901",
				"email@exemplo.com", "11912345678", LocalDate.of(1990,5,15),
				"Rua A, 123", "Cidade", "SP", "01001000", Instant.now()
		);

		when(repository.buscarPorId(id)).thenReturn(Optional.of(segurado));
		when(repository.salvar(any())).thenReturn(updatedSegurado);
		when(mapper.toResponse(updatedSegurado)).thenReturn(responseDTO);

		SeguradoResponseDTO resultado = useCase.executar(id, dto);

		assertNotNull(resultado);
		assertEquals("Nome Atualizado", resultado.nomeRazaoSocial());
		verify(repository, times(1)).buscarPorId(id);
		verify(repository, times(1)).salvar(any());
	}

	@Test
	void deveLancarExcecao_quandoSeguradoNaoEncontrado() {
		UUID id = UUID.randomUUID();
		SeguradoUpdateDTO dto = new SeguradoUpdateDTO(null, null, null, null, null, null, null, null);

		when(repository.buscarPorId(id)).thenReturn(Optional.empty());

		assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(id, dto));
		verify(repository, times(1)).buscarPorId(id);
		verify(repository, never()).salvar(any());
	}
}
