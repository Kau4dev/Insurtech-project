package com.insurtech.notificacao.unit;

import com.insurtech.notificacao.application.dto.NotificacaoResponseDTO;
import com.insurtech.notificacao.application.usecase.BuscarNotificacoesUseCase;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BuscarNotificacoesUseCaseTest {

    @Mock
    private NotificacaoRepository repository;

    @InjectMocks
    private BuscarNotificacoesUseCase useCase;

    @Test
    @DisplayName("Deve listar notificações filtrando por ID do segurado")
    void deveListarNotificacoesPorSeguradoId() {
        UUID seguradoId = UUID.randomUUID();
        Notificacao notif = new Notificacao();
        notif.setId(UUID.randomUUID());
        notif.setSeguradoId(seguradoId);
        notif.setTitulo("Teste");
        notif.setMensagem("Mensagem teste");
        notif.setTipo(TipoNotificacao.SINISTRO_REGISTRADO);
        notif.setLida(false);
        notif.setCriadoEm(Instant.now());

        when(repository.listarPorSeguradoId(seguradoId, false)).thenReturn(List.of(notif));

        List<NotificacaoResponseDTO> resultado = useCase.executar(seguradoId, false);

        assertEquals(1, resultado.size());
        assertEquals("Teste", resultado.getFirst().titulo());
        verify(repository).listarPorSeguradoId(seguradoId, false);
    }

    @Test
    @DisplayName("Deve listar todas as notificações quando o ID do segurado for nulo")
    void deveListarTodasQuandoSeguradoIdNull() {
        Notificacao notif = new Notificacao();
        notif.setId(UUID.randomUUID());
        notif.setSeguradoId(UUID.randomUUID());
        notif.setTitulo("Geral");
        notif.setMensagem("Mensagem");
        notif.setTipo(TipoNotificacao.PAGAMENTO_LIQUIDADO);
        notif.setLida(true);
        notif.setCriadoEm(Instant.now());

        when(repository.listarTodas(null)).thenReturn(List.of(notif));

        List<NotificacaoResponseDTO> resultado = useCase.executar(null, null);

        assertEquals(1, resultado.size());
        verify(repository).listarTodas(null);
    }

    @Test
    @DisplayName("Deve diferenciar leitura quando usuário for SEGURADO vs INTERNO")
    void deveDiferenciarLeituraPorPerfil() {
        UUID seguradoId = UUID.randomUUID();
        Notificacao notif = new Notificacao();
        notif.setId(UUID.randomUUID());
        notif.setSeguradoId(seguradoId);
        notif.setTitulo("Aviso");
        notif.setMensagem("Mensagem");
        notif.setTipo(TipoNotificacao.SINISTRO_REGISTRADO);
        notif.setLidaSegurado(true);
        notif.setLidaInterno(false);
        notif.setCriadoEm(Instant.now());

        // Contexto Segurado: deve ver lida = true
        when(repository.listarPorSeguradoId(seguradoId, null)).thenReturn(List.of(notif));
        List<NotificacaoResponseDTO> resSegurado = useCase.executar(seguradoId, null);
        assertTrue(resSegurado.getFirst().lida());

        // Contexto Interno: deve ver lida = false
        when(repository.listarTodas(null)).thenReturn(List.of(notif));
        List<NotificacaoResponseDTO> resInterno = useCase.executar(null, null);
        assertFalse(resInterno.getFirst().lida());
    }
}

