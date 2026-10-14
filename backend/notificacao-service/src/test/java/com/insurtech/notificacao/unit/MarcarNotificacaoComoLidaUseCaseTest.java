package com.insurtech.notificacao.unit;

import com.insurtech.notificacao.application.usecase.MarcarNotificacaoComoLidaUseCase;
import com.insurtech.notificacao.domain.model.Notificacao;
import com.insurtech.notificacao.domain.repository.NotificacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarcarNotificacaoComoLidaUseCaseTest {

    @Mock
    private NotificacaoRepository repository;

    @InjectMocks
    private MarcarNotificacaoComoLidaUseCase useCase;

    @Test
    void deveMarcarComoLidaComSucesso() {
        UUID id = UUID.randomUUID();
        Notificacao notif = new Notificacao();
        notif.setId(id);
        notif.setLida(false);

        when(repository.buscarPorId(id)).thenReturn(Optional.of(notif));

        useCase.executar(id);

        assertTrue(notif.isLida());
        verify(repository).salvar(notif);
    }

    @Test
    void deveMarcarTodasComoLidasPorSegurado() {
        UUID seguradoId = UUID.randomUUID();

        useCase.executarMarcarTodas(seguradoId);

        verify(repository).marcarTodasComoLidasPorSegurado(seguradoId);
    }

    @Test
    void deveMarcarTodasComoLidasGlobalmente() {
        useCase.executarMarcarTodas(null);

        verify(repository).marcarTodasComoLidas();
    }
}

