package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.AguardarDocumentosUseCase;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.StatusInvalidoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AguardarDocumentosUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private SinistroSecurityValidator securityValidator;

    @Mock
    private EventPublisherPort eventPublisher;

    @InjectMocks
    private AguardarDocumentosUseCase useCase;

    @Test
    @DisplayName("Deve alterar status do sinistro para aguardando documentos com sucesso como analista")
    void deveAguardarDocumentos_comSucesso_comoAnalista() {
        UUID sinistroId = UUID.randomUUID();
        UUID analistaId = UUID.randomUUID();

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.EM_ANALISE);
        sinistro.setAnalistaId(analistaId);

        SinistroResponseDTO responseDTO = mock(SinistroResponseDTO.class);

        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(sinistroId);

        assertNotNull(resultado);
        assertEquals(Status.AGUARDANDO_DOCUMENTOS, sinistro.getStatus());

        verify(securityValidator, times(1)).validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"));
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, times(1)).salvar(sinistro);
        verify(mapper, times(1)).toResponse(sinistro);
        verify(eventPublisher, times(1)).publicarDocumentoSolicitado(any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando o usuário não estiver autenticado ao aguardar documentos")
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        UUID sinistroId = UUID.randomUUID();
        doThrow(new UsuarioNaoAutenticadoException("Usuário não autenticado"))
                .when(securityValidator).validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"));

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(sinistroId));
        verifyNoInteractions(repository, mapper);
    }

    @Test
    @DisplayName("Deve lançar exceção quando o papel do usuário não for permitido ao aguardar documentos")
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        UUID sinistroId = UUID.randomUUID();
        doThrow(new AcessoNegadoException("Acesso negado."))
                .when(securityValidator).validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"));

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(sinistroId));
        verifyNoInteractions(repository, mapper);
    }

    @Test
    @DisplayName("Deve lançar exceção quando o sinistro não for encontrado ao aguardar documentos")
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID sinistroId = UUID.randomUUID();

        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(sinistroId));

        verify(securityValidator, times(1)).validarPapeis(anyString(), eq("ANALISTA"), eq("GESTOR"));
        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }

    @Test
    @DisplayName("Deve lançar exceção quando o status do sinistro não permitir transição para aguardando documentos")
    void deveLancarExcecao_quandoStatusInvalido() {
        UUID sinistroId = UUID.randomUUID();

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.REGISTRADO); // Não está EM_ANALISE

        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));

        assertThrows(StatusInvalidoException.class, () -> useCase.executar(sinistroId));

        verify(repository, times(1)).buscarPorId(sinistroId);
        verify(repository, never()).salvar(any());
        verifyNoInteractions(mapper);
    }
}
