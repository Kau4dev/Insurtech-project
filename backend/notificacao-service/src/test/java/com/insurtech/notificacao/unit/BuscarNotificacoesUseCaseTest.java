package com.insurtech.notificacao.unit;

import com.insurtech.notificacao.application.dto.NotificacaoResponseDTO;
import com.insurtech.notificacao.application.usecase.BuscarNotificacoesUseCase;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.model.TipoNotificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
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
}

