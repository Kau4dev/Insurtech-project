package com.insurtech.liquidacao.unit.application;

import com.insurtech.liquidacao.application.dto.PagamentoLiquidadoEventDTO;
import com.insurtech.liquidacao.application.dto.SinistroAprovadoEventDTO;
import com.insurtech.liquidacao.application.port.EventPublisherPort;
import com.insurtech.liquidacao.application.usecase.ProcessarLiquidacaoUseCase;
import com.insurtech.liquidacao.domain.model.EventoPagamento;
import com.insurtech.liquidacao.domain.repository.EventoPagamentoRepository;
import com.insurtech.liquidacao.infrastructure.persistence.inbox.InboxEventJpaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessarLiquidacaoUseCaseTest {

    @Mock
    private EventoPagamentoRepository repository;

    @Mock
    private EventPublisherPort eventPublisher;

    @Mock
    private InboxEventJpaRepository inboxRepository;

    @InjectMocks
    private ProcessarLiquidacaoUseCase useCase;

    @Test
    @DisplayName("Deve processar liquidação e publicar evento de sucesso")
    void deveProcessarLiquidacaoEPublicarEventoSucesso() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String eventoIdOrigem = UUID.randomUUID().toString();
        
        SinistroAprovadoEventDTO dto = new SinistroAprovadoEventDTO(
                sinistroId,
                seguradoId,
                new BigDecimal("1000.00")
        );

        when(inboxRepository.existsByMessageId(eventoIdOrigem)).thenReturn(false);

        useCase.executar(dto, eventoIdOrigem);

        // Verifica que salvou no Inbox e 2 vezes no repository (como PENDENTE e depois PROCESSADO)
        verify(inboxRepository, times(1)).save(any());
        verify(repository, times(2)).salvar(any(EventoPagamento.class));
        
        // Verifica que o evento de sucesso foi publicado
        ArgumentCaptor<PagamentoLiquidadoEventDTO> captor = ArgumentCaptor.forClass(PagamentoLiquidadoEventDTO.class);
        verify(eventPublisher, times(1)).publicarPagamentoLiquidado(captor.capture());
        
        PagamentoLiquidadoEventDTO publicado = captor.getValue();
        assertEquals(sinistroId, publicado.sinistroId());
        assertEquals(seguradoId, publicado.seguradoId());
        assertEquals("PROCESSADO", publicado.status());
    }

    @Test
    @DisplayName("Deve ignorar mensagem duplicada quando já existir no Inbox")
    void deveIgnorarMensagemDuplicadaQuandoJaExistirNoInbox() {
        SinistroAprovadoEventDTO dto = new SinistroAprovadoEventDTO(
                UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("15000.00")
        );
        String messageId = UUID.randomUUID().toString();

        when(inboxRepository.existsByMessageId(messageId)).thenReturn(true);

        useCase.executar(dto, messageId);

        // Verifica que NÃO tentou salvar pagamento nem publicar evento
        verify(repository, never()).salvar(any());
        verify(eventPublisher, never()).publicarPagamentoLiquidado(any());
    }

    @Test
    @DisplayName("Deve publicar evento de falha quando ocorre erro no processamento")
    void devePublicarEventoDeFalha_quandoOcorreErroNoProcessamento() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String eventoIdOrigem = UUID.randomUUID().toString();
        
        SinistroAprovadoEventDTO dto = new SinistroAprovadoEventDTO(
                sinistroId,
                seguradoId,
                new BigDecimal("1000.00")
        );

        when(inboxRepository.existsByMessageId(eventoIdOrigem)).thenReturn(false);
        
        // Força um erro no repositório na SEGUNDA vez que for chamado
        doAnswer(invocation -> null) // 1ª chamada passa normal (salvar pendente)
            .doThrow(new RuntimeException("Database error")) // 2ª chamada falha (salvar processado)
            .doAnswer(invocation -> null) // 3ª chamada passa normal (salvar falha - dentro do catch)
            .when(repository).salvar(any(EventoPagamento.class));

        useCase.executar(dto, eventoIdOrigem);

        ArgumentCaptor<PagamentoLiquidadoEventDTO> captor = ArgumentCaptor.forClass(PagamentoLiquidadoEventDTO.class);
        verify(eventPublisher, times(1)).publicarPagamentoLiquidado(captor.capture());
        
        PagamentoLiquidadoEventDTO publicado = captor.getValue();
        assertEquals(sinistroId, publicado.sinistroId());
        assertEquals(seguradoId, publicado.seguradoId());
        assertEquals("FALHOU", publicado.status());
    }
}
