package com.insurtech.sinistros.unit.application;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.application.usecase.CadastrarSinistroUseCase;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.ApoliceInvalidaException;
import com.insurtech.sinistros.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.sinistros.domain.exception.DataOcorrenciaInvalidaException;
import com.insurtech.sinistros.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistrojaCadastradaException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.ApoliceClient;
import com.insurtech.sinistros.infrastructure.client.dto.ApoliceResponseDTO;
import com.insurtech.sinistros.infrastructure.client.dto.SeguradoResponseDTO;
import com.insurtech.sinistros.infrastructure.client.dto.TipoPessoa;
import com.insurtech.sinistros.infrastructure.client.dto.Uf;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CadastrarSinistroUseCaseTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private SinistroMapper mapper;

    @Mock
    private ApoliceClient apoliceClient;

    @Mock
    private EventPublisherPort eventPublisher;

    @Mock
    private SinistroSecurityValidator securityValidator;

    @InjectMocks
    private CadastrarSinistroUseCase useCase;

    private SeguradoResponseDTO seguradoValido(UUID seguradoId, UUID usuarioId) {
        return new SeguradoResponseDTO(
                seguradoId,
                usuarioId,
                TipoPessoa.PF,
                "Segurado Teste",
                "12345678909",
                "teste@email.com",
                "11999999999",
                LocalDate.of(1990, 1, 1),
                "Rua A",
                "São Paulo",
                Uf.SP,
                "01001-000",
                Instant.now()
        );
    }

    private ApoliceResponseDTO apoliceValida(UUID apoliceId, UUID seguradoId) {
        return apolice(apoliceId, seguradoId, com.insurtech.sinistros.infrastructure.client.dto.Status.ATIVA);
    }

    private ApoliceResponseDTO apolice(UUID apoliceId, UUID seguradoId,
                                       com.insurtech.sinistros.infrastructure.client.dto.Status status) {
        return new ApoliceResponseDTO(
                apoliceId, seguradoId, "AP-1",
                null, new BigDecimal("50000.00"), new BigDecimal("1000.00"),
                LocalDate.now().minusYears(1), LocalDate.now().plusYears(1),
                status, Collections.emptyList(), Instant.now(), Instant.now()
        );
    }

    private SinistroRequestDTO dtoPadrao(UUID apoliceId, UUID seguradoId, LocalDate data) {
        return new SinistroRequestDTO(
                "SIN-X", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "desc", data, new BigDecimal("1000.00")
        );
    }

    @Test
    void deveCadastrarSinistro_comSucesso_comoAnalista() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345",
                apoliceId,
                seguradoId,
                TipoSinistro.COLISAO,
                "Batida de carro",
                LocalDate.now(),
                new BigDecimal("5000.00")
        );

        Sinistro sinistro = new Sinistro();
        UUID sinistroId = UUID.randomUUID();
        sinistro.setId(sinistroId);
        sinistro.setSeguradoId(seguradoId);
        sinistro.setNumeroSinistro("SIN-12345");

        SinistroResponseDTO responseDTO = new SinistroResponseDTO(
                sinistroId, "SIN-12345", apoliceId, seguradoId,
                null, TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00"),
                null, Status.REGISTRADO, null, Instant.now(), Instant.now()
        );

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));
        when(repository.buscarPorNumero("SIN-12345")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(sinistro);
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(responseDTO);

        SinistroResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertEquals("SIN-12345", resultado.numeroSinistro());
        assertEquals(Status.REGISTRADO, resultado.status());
        verify(securityValidator, times(1)).validarPapeis("ANALISTA", "GESTOR", "ADMIN", "SEGURADO");
        verify(securityValidator, times(1)).buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString());
        verify(repository, times(1)).salvar(any());
        verify(eventPublisher, times(1)).publicarSinistroRegistrado(any(SinistroRegistradoEvent.class));
    }

    @Test
    void deveCadastrarSinistro_comSucesso_comoSeguradoDono() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-SEGURADO",
                apoliceId, seguradoId,
                TipoSinistro.COLISAO, "desc",
                LocalDate.now(), new BigDecimal("1000.00")
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setSeguradoId(seguradoId);
        sinistro.setNumeroSinistro("SIN-SEGURADO");

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));
        when(repository.buscarPorNumero("SIN-SEGURADO")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(sinistro);
        when(repository.salvar(any())).thenReturn(sinistro);
        when(mapper.toResponse(sinistro)).thenReturn(mock(SinistroResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(dto));
        verify(securityValidator, times(1)).validarPapeis("ANALISTA", "GESTOR", "ADMIN", "SEGURADO");
    }

    @Test
    void deveLancarExcecao_quandoValidatorRecusaSeguradoDeOutro() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-SEGURADO-OUTRO",
                apoliceId, seguradoId,
                TipoSinistro.COLISAO, "desc",
                LocalDate.now(), new BigDecimal("1000.00")
        );

        doThrow(new AcessoNegadoException("Acesso negado. Você só pode registrar sinistros para o seu próprio cadastro."))
                .when(securityValidator).buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString());

        AcessoNegadoException exception = assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        assertEquals("Acesso negado. Você só pode registrar sinistros para o seu próprio cadastro.", exception.getMessage());
        verifyNoInteractions(apoliceClient, repository, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-AUTH", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.COLISAO, "desc", LocalDate.now(), new BigDecimal("1000.00")
        );
        doThrow(new UsuarioNaoAutenticadoException("Usuário não autenticado"))
                .when(securityValidator).validarPapeis(anyString(), anyString(), anyString(), anyString());

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, apoliceClient, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoPapelNaoPermitido() {
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-403", UUID.randomUUID(), UUID.randomUUID(),
                TipoSinistro.COLISAO, "desc", LocalDate.now(), new BigDecimal("1000.00")
        );
        doThrow(new AcessoNegadoException("Acesso negado."))
                .when(securityValidator).validarPapeis(anyString(), anyString(), anyString(), anyString());

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, apoliceClient, eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontradoPeloValidator() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00")
        );

        doThrow(new SeguradoNaoEncontradoException("Segurado não encontrado: " + seguradoId))
                .when(securityValidator).buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString());

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEncontrada() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00")
        );

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, StandardCharsets.UTF_8, new RequestTemplate());
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenThrow(exception);

        assertThrows(ApoliceNaoEncontradaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoApoliceRetornarNula() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(null);

        assertThrows(ApoliceNaoEncontradaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now())));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoPertenceAoSegurado() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, UUID.randomUUID()));

        assertThrows(ApoliceInvalidaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now())));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoApoliceNaoEstiverAtiva() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(
                apolice(apoliceId, seguradoId, com.insurtech.sinistros.infrastructure.client.dto.Status.CANCELADA));

        assertThrows(ApoliceInvalidaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now())));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoDataOcorrenciaFutura() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));

        DataOcorrenciaInvalidaException ex = assertThrows(DataOcorrenciaInvalidaException.class,
                () -> useCase.executar(dtoPadrao(apoliceId, seguradoId, LocalDate.now().plusDays(1))));
        assertTrue(ex.getMessage().contains("futura"));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoDataOcorrenciaAnteriorAoInicioDaVigencia() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        LocalDate dataOcorrencia = LocalDate.of(2026, 9, 21);
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-VIGENCIA-1", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida antes da vigência",
                dataOcorrencia, new BigDecimal("3000.00")
        );

        ApoliceResponseDTO apolice = new ApoliceResponseDTO(
                apoliceId, seguradoId, "AP-1020-9090",
                null, new BigDecimal("50000.00"), new BigDecimal("1000.00"),
                LocalDate.of(2026, 10, 1), LocalDate.of(2027, 10, 1),
                null, Collections.emptyList(), Instant.now(), Instant.now()
        );

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apolice);

        DataOcorrenciaInvalidaException ex = assertThrows(
                DataOcorrenciaInvalidaException.class,
                () -> useCase.executar(dto)
        );

        assertTrue(ex.getMessage().contains("Data do ocorrido anterior ao início da vigência da apólice"));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoDataOcorrenciaPosteriorAoFimDaVigencia() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        LocalDate dataOcorrencia = LocalDate.of(2025, 2, 15);
        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-VIGENCIA-2", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida após a vigência",
                dataOcorrencia, new BigDecimal("3000.00")
        );

        ApoliceResponseDTO apolice = new ApoliceResponseDTO(
                apoliceId, seguradoId, "AP-1020-9090",
                null, new BigDecimal("50000.00"), new BigDecimal("1000.00"),
                LocalDate.of(2024, 1, 1), LocalDate.of(2025, 1, 1),
                null, Collections.emptyList(), Instant.now(), Instant.now()
        );

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apolice);

        DataOcorrenciaInvalidaException ex = assertThrows(
                DataOcorrenciaInvalidaException.class,
                () -> useCase.executar(dto)
        );

        assertTrue(ex.getMessage().contains("Data do ocorrido posterior ao término da vigência da apólice"));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void deveLancarExcecao_quandoSinistroJaCadastrado() {
        UUID seguradoId = UUID.randomUUID();
        UUID apoliceId = UUID.randomUUID();

        SinistroRequestDTO dto = new SinistroRequestDTO(
                "SIN-12345", apoliceId, seguradoId,
                TipoSinistro.COLISAO, "Batida de carro",
                LocalDate.now(), new BigDecimal("5000.00")
        );

        when(securityValidator.buscarEValidarPropriedadeSegurado(eq(seguradoId), anyString()))
                .thenReturn(seguradoValido(seguradoId, UUID.randomUUID()));
        when(apoliceClient.buscarPorId(apoliceId)).thenReturn(apoliceValida(apoliceId, seguradoId));
        when(repository.buscarPorNumero("SIN-12345")).thenReturn(Optional.of(new Sinistro()));

        assertThrows(SinistrojaCadastradaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
        verifyNoInteractions(eventPublisher);
    }
}