package com.insurtech.apolices.unit.application;

import com.insurtech.apolices.application.dto.ApoliceRequestDTO;
import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.CoberturaRequestDTO;
import com.insurtech.apolices.application.usecase.CadastrarApoliceUseCase;
import com.insurtech.apolices.domain.exception.AcessoNegadoException;
import com.insurtech.apolices.domain.exception.ApolicejaCadastradaException;
import com.insurtech.apolices.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.apolices.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Cobertura;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoCobertura;
import com.insurtech.apolices.domain.model.TipoSeguro;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.client.SeguradoClient;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import com.insurtech.apolices.infrastructure.security.UserContext;
import com.insurtech.apolices.infrastructure.security.UserContextHolder;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static java.time.temporal.ChronoUnit.DAYS;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CadastrarApoliceUseCaseTest {

    @Mock
    private ApoliceRepository repository;

    @Mock
    private ApoliceMapper mapper;

    @Mock
    private SeguradoClient client;

    @InjectMocks
    private CadastrarApoliceUseCase useCase;

    @AfterEach
    void tearDown() {
        UserContextHolder.clear();
    }

    private void setUserContext(String usuarioId, String papel) {
        UserContext ctx = UserContextHolder.getContext();
        ctx.setUsuarioId(usuarioId);
        ctx.setUsuarioPapel(papel);
    }

    @Test
    void deveCadastrarApolice_comSucesso_comoGestor() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-12345", TipoSeguro.VIDA,
                new BigDecimal("50000.00"), new BigDecimal("150.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        Apolice apolice = new Apolice();
        UUID apoliceId = UUID.randomUUID();

        ApoliceResponseDTO responseDTO = new ApoliceResponseDTO(
                apoliceId, seguradoId, "IT-12345", TipoSeguro.VIDA,
                new BigDecimal("50000.00"), new BigDecimal("150.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), Status.ATIVA,
                Collections.emptyList(), Instant.now(), Instant.now().minus(1, DAYS)
        );

        when(client.buscarPorId(seguradoId)).thenReturn(null);
        when(repository.buscarPorNumero("IT-12345")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(apolice);
        when(repository.salvar(any())).thenReturn(apolice);
        when(mapper.toResponse(apolice)).thenReturn(responseDTO);

        ApoliceResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertEquals("IT-12345", resultado.numeroApolice());
        verify(repository, times(1)).salvar(any());
    }

    @Test
    void deveCadastrarApolice_comSucesso_comoAdmin() {
        setUserContext(UUID.randomUUID().toString(), "ADMIN");

        UUID seguradoId = UUID.randomUUID();
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-ADMIN", TipoSeguro.VIDA,
                new BigDecimal("50000.00"), new BigDecimal("150.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        Apolice apolice = new Apolice();
        when(client.buscarPorId(seguradoId)).thenReturn(null);
        when(repository.buscarPorNumero("IT-ADMIN")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(apolice);
        when(repository.salvar(any())).thenReturn(apolice);
        when(mapper.toResponse(apolice)).thenReturn(mock(ApoliceResponseDTO.class));

        assertDoesNotThrow(() -> useCase.executar(dto));
    }

    @Test
    void deveLancarExcecao_quandoUsuarioNaoAutenticado() {
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                UUID.randomUUID(), "IT-AUTH", TipoSeguro.VIDA,
                new BigDecimal("1000.00"), new BigDecimal("100.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        assertThrows(UsuarioNaoAutenticadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, client, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelAnalista() {
        setUserContext(UUID.randomUUID().toString(), "ANALISTA");

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                UUID.randomUUID(), "IT-403", TipoSeguro.VIDA,
                new BigDecimal("1000.00"), new BigDecimal("100.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, client, mapper);
    }

    @Test
    void deveLancarExcecao_quandoPapelSegurado() {
        setUserContext(UUID.randomUUID().toString(), "SEGURADO");

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                UUID.randomUUID(), "IT-403", TipoSeguro.VIDA,
                new BigDecimal("1000.00"), new BigDecimal("100.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        assertThrows(AcessoNegadoException.class, () -> useCase.executar(dto));
        verifyNoInteractions(repository, client, mapper);
    }

    @Test
    void deveCadastrarApolice_comCoberturasGerandoIdsEapoliceId() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        CoberturaRequestDTO coberturaDTO = new CoberturaRequestDTO(
                TipoCobertura.MORTE, new BigDecimal("10000.00"), new BigDecimal("500.00")
        );

        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-99999", TipoSeguro.VIDA,
                new BigDecimal("50000.00"), new BigDecimal("150.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), List.of(coberturaDTO)
        );

        Cobertura cobertura = new Cobertura();
        cobertura.setTipoCobertura(TipoCobertura.MORTE);
        cobertura.setValorCobertura(new BigDecimal("10000.00"));
        cobertura.setValorFranquia(new BigDecimal("500.00"));

        Apolice apolice = new Apolice();
        apolice.setCoberturas(new ArrayList<>(List.of(cobertura)));

        when(client.buscarPorId(seguradoId)).thenReturn(null);
        when(repository.buscarPorNumero("IT-99999")).thenReturn(Optional.empty());
        when(mapper.toDomain(dto)).thenReturn(apolice);
        when(repository.salvar(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(mapper.toResponse(any(Apolice.class))).thenReturn(mock(ApoliceResponseDTO.class));

        ApoliceResponseDTO resultado = useCase.executar(dto);

        assertNotNull(resultado);
        assertNotNull(apolice.getId());
        assertNotNull(cobertura.getId());
        assertEquals(apolice.getId(), cobertura.getApoliceId());
        verify(repository, times(1)).salvar(argThat(saved ->
                saved.getCoberturas() != null
                        && saved.getCoberturas().size() == 1
                        && saved.getCoberturas().get(0).getId() != null
                        && saved.getCoberturas().get(0).getApoliceId() != null
                        && saved.getCoberturas().get(0).getApoliceId().equals(saved.getId())
        ));
    }

    @Test
    void deveLancarExcecao_quandoSeguradoNaoEncontrado() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-12345", TipoSeguro.VIDA,
                new BigDecimal("1000.00"), new BigDecimal("100.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        Request request = Request.create(Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound exception = new FeignException.NotFound("Not Found", request, null, null);

        when(client.buscarPorId(seguradoId)).thenThrow(exception);

        assertThrows(SeguradoNaoEncontradoException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }

    @Test
    void deveLancarExcecao_quandoApoliceJaCadastrada() {
        setUserContext(UUID.randomUUID().toString(), "GESTOR");

        UUID seguradoId = UUID.randomUUID();
        ApoliceRequestDTO dto = new ApoliceRequestDTO(
                seguradoId, "IT-12345", TipoSeguro.VIDA,
                new BigDecimal("1000.00"), new BigDecimal("100.00"),
                LocalDate.now(), LocalDate.now().plusYears(1), null
        );

        when(client.buscarPorId(seguradoId)).thenReturn(null);
        when(repository.buscarPorNumero("IT-12345")).thenReturn(Optional.of(new Apolice()));

        assertThrows(ApolicejaCadastradaException.class, () -> useCase.executar(dto));
        verify(repository, never()).salvar(any());
    }
}
