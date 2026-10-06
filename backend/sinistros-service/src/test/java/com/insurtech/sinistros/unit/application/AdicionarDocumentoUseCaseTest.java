package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.response.DocumentoSinistroResponseDTO;
import com.insurtech.sinistros.application.usecase.AdicionarDocumentoUseCase;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.AnalistaObrigatorioException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoDocumento;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
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

    @Mock
    private SinistroSecurityValidator securityValidator;

    @InjectMocks
    private AdicionarDocumentoUseCase useCase;

    private UserContext criarContexto(String usuarioId, String papel) {
        UserContext ctx = new UserContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
        return ctx;
    }

    @Test
    void deveAdicionarDocumento_comSucesso_comoAnalista() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        when(securityValidator.validarAutenticacao()).thenReturn(criarContexto(usuarioId.toString(), "ANALISTA"));

        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(
                TipoDocumento.BOLETIM_OCORRENCIA,
                "BO.pdf",
                "http://url/bo.pdf"
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(id);
        sinistro.setStatus(Status.EM_ANALISE);
        sinistro.setAnalistaId(UUID.randomUUID());

        DocumentoSinistroResponseDTO responseDTO = mock(DocumentoSinistroResponseDTO.class);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(any(DocumentoSinistro.class))).thenReturn(responseDTO);

        DocumentoSinistroResponseDTO resultado = useCase.executar(id, dto);

        assertNotNull(resultado);
        assertEquals(1, sinistro.getDocumentos().size());
        assertEquals(TipoDocumento.BOLETIM_OCORRENCIA, sinistro.getDocumentos().get(0).getTipoDocumento());
        assertEquals(id, sinistro.getDocumentos().get(0).getSinistroId());
        verify(securityValidator, times(1)).validarAutenticacao();
        verify(securityValidator, times(1)).validarPropriedadeSegurado(sinistro.getSeguradoId(), "Acesso negado. Você só pode adicionar documentos aos seus próprios sinistros.");
        verify(repository, times(1)).salvar(sinistro);
    }

    @Test
    void deveAdicionarDocumento_comSucesso_comoSeguradoDono() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        when(securityValidator.validarAutenticacao()).thenReturn(criarContexto(usuarioId.toString(), "SEGURADO"));

        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(
                TipoDocumento.BOLETIM_OCORRENCIA,
                "BO.pdf",
                "http://url/bo.pdf"
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(id);
        sinistro.setSeguradoId(seguradoId);
        sinistro.setStatus(Status.AGUARDANDO_DOCUMENTOS);
        sinistro.setAnalistaId(UUID.randomUUID());

        DocumentoSinistroResponseDTO responseDTO = mock(DocumentoSinistroResponseDTO.class);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        when(repository.salvar(any(Sinistro.class))).thenReturn(sinistro);
        when(mapper.toResponse(any(DocumentoSinistro.class))).thenReturn(responseDTO);

        DocumentoSinistroResponseDTO resultado = useCase.executar(id, dto);

        assertNotNull(resultado);
        assertEquals(Status.EM_ANALISE, sinistro.getStatus()); // transição automática
        verify(securityValidator, times(1)).validarPropriedadeSegurado(eq(seguradoId), anyString());
        verify(repository, times(1)).salvar(sinistro);
    }

    @Test
    void deveLancarExcecao_quandoValidatorRecusaAcesso() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        when(securityValidator.validarAutenticacao()).thenReturn(criarContexto(usuarioId.toString(), "SEGURADO"));

        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(
                TipoDocumento.BOLETIM_OCORRENCIA,
                "BO.pdf",
                "http://url/bo.pdf"
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(id);
        sinistro.setSeguradoId(seguradoId);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));
        doThrow(new AcessoNegadoException("Acesso negado."))
                .when(securityValidator).validarPropriedadeSegurado(eq(seguradoId), anyString());

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        UUID id = UUID.randomUUID();
        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(TipoDocumento.BOLETIM_OCORRENCIA, "BO.pdf", "http://url");
        doThrow(new UsuarioNaoAutenticadoException("Usuário não autenticado"))
                .when(securityValidator).validarAutenticacao();

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(id, dto));
        verifyNoInteractions(repository);
    }

    @Test
    void deveLancarExcecao_quandoSinistroNaoEncontrado() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        when(securityValidator.validarAutenticacao()).thenReturn(criarContexto(usuarioId.toString(), "ANALISTA"));
        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(TipoDocumento.BOLETIM_OCORRENCIA, "BO.pdf", "http://url");

        when(repository.buscarPorId(id)).thenReturn(Optional.empty());

        assertThrows(SinistroNaoEncontradoException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoAnalistaNaoAtribuido() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        when(securityValidator.validarAutenticacao()).thenReturn(criarContexto(usuarioId.toString(), "ANALISTA"));
        AdicionarDocumentoRequestDTO dto = new AdicionarDocumentoRequestDTO(TipoDocumento.BOLETIM_OCORRENCIA, "BO.pdf", "http://url");
        Sinistro sinistro = new Sinistro();
        sinistro.setAnalistaId(null); // sem analista

        when(repository.buscarPorId(id)).thenReturn(Optional.of(sinistro));

        assertThrows(AnalistaObrigatorioException.class, () -> useCase.executar(id, dto));
        verify(repository, never()).salvar(any());
    }
}
