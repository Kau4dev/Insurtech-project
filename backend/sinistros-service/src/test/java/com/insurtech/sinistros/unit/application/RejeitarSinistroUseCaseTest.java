package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.RejeitarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.RejeitarSinistroUseCase;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;
import com.insurtech.sinistros.domain.exception.StatusInvalidoException;
import com.insurtech.sinistros.domain.exception.MotivoRejeicaoObrigatorioException;
import com.insurtech.sinistros.domain.exception.DocumentoObrigatorioException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
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
class RejeitarSinistroUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private EventPublisherPort eventPublisher;

    @InjectMocks
    private RejeitarSinistroUseCase useCase;

    private Sinistro criarSinistroValidoParaRejeicao() {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setSeguradoId(UUID.randomUUID());
        sinistro.setStatus(Status.EM_ANALISE);
        sinistro.setAnalistaId(UUID.randomUUID());
        
        DocumentoSinistro doc = new DocumentoSinistro();
        doc.setId(UUID.randomUUID());
        sinistro.getDocumentos().add(doc);
        return sinistro;
    }

    @Test
    void deveRejeitarSinistro_comSucesso() {
        UUID id = UUID.randomUUID();
        RejeitarSinistroRequestDTO dto = new RejeitarSinistroRequestDTO("Falta de documentacao");
        Sinistro sinistro = criarSinistroValidoParaRejeicao();
        
        SinistroResponseDTO responseDTO = mock(SinistroResponseDTO.class);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(id, dto);

        assertNotNull(resultado);
        assertEquals(Status.REJEITADO, sinistro.getStatus());
        assertEquals("Falta de documentacao", sinistro.getMotivoRejeicao());
        verify(repository, times(1)).salvar(sinistro);
        verify(eventPublisher, times(1)).publicarSinistroRejeitado(any(SinistroRejeitadoEvent.class));
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID id = UUID.randomUUID();
        RejeitarSinistroRequestDTO dto = new RejeitarSinistroRequestDTO("Falta de documentacao");

        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> useCase.executar(id, dto));
        verify(repository, times(1)).buscarPorId(id);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoStatusInvalido() {
        UUID id = UUID.randomUUID();
        RejeitarSinistroRequestDTO dto = new RejeitarSinistroRequestDTO("Falta de documentacao");
        Sinistro sinistro = criarSinistroValidoParaRejeicao();
        sinistro.setStatus(Status.REGISTRADO);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));

        assertThrows(StatusInvalidoException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoMotivoRejeicaoNuloOuVazio() {
        UUID id = UUID.randomUUID();
        RejeitarSinistroRequestDTO dto = new RejeitarSinistroRequestDTO("   ");
        Sinistro sinistro = criarSinistroValidoParaRejeicao();

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));

        assertThrows(MotivoRejeicaoObrigatorioException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoRejeitarSemDocumentos() {
        UUID id = UUID.randomUUID();
        RejeitarSinistroRequestDTO dto = new RejeitarSinistroRequestDTO("Motivo");
        Sinistro sinistro = criarSinistroValidoParaRejeicao();
        sinistro.getDocumentos().clear();

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));

        assertThrows(DocumentoObrigatorioException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }
}
