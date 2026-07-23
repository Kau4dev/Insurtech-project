package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.response.DocumentoSinistroResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.AdicionarDocumentoUseCase;
import com.insurtech.sinistros.domain.exception.AnalistaObrigatorioException;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoDocumento;
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
class AdicionarDocumentoUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @InjectMocks
    private AdicionarDocumentoUseCase useCase;

    @Test
    void deveAdicionarDocumento_comSucesso() {
        UUID id = UUID.randomUUID();

        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(
                TipoDocumento.BOLETIM_OCORRENCIA,
                "BO.pdf",
                "http://url/bo.pdf"
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(id);
        sinistro.setStatus(Status.EM_ANALISE);
        sinistro.setAnalistaId(UUID.randomUUID());

        DocumentoSinistroResponseDTO responseDTO = mock(DocumentoSinistroResponseDTO.class);  // ← tipo correto

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(any(DocumentoSinistro.class))).thenReturn(responseDTO);

        DocumentoSinistroResponseDTO resultado = useCase.executar(id, dto);

        assertNotNull(resultado);
        assertEquals(1, sinistro.getDocumentos().size());                   // ← documento foi adicionado
        assertEquals(TipoDocumento.BOLETIM_OCORRENCIA,                      // ← tipo correto
                sinistro.getDocumentos().get(0).getTipoDocumento());
        assertEquals(id, sinistro.getDocumentos().get(0).getSinistroId());  // ← sinistroId foi setado
        verify(repository, times(1)).salvar(sinistro);
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID id = UUID.randomUUID();
        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(TipoDocumento.BOLETIM_OCORRENCIA, "BO.pdf", "http://url");

        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoAnalistaNaoAtribuido() {
        UUID id = UUID.randomUUID();
        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(TipoDocumento.BOLETIM_OCORRENCIA, "BO.pdf", "http://url");
        Sinistro sinistro = new Sinistro();
        sinistro.setAnalistaId(null); // sem analista

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));

        assertThrows(AnalistaObrigatorioException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
    }
}
