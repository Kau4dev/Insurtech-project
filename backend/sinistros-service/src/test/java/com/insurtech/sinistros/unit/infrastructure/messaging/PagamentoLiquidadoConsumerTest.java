package com.insurtech.sinistros.unit.infrastructure.messaging;

import com.insurtech.sinistros.domain.event.PagamentoLiquidadoEvent;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.cache.DashboardCacheInvalidator;
import com.insurtech.sinistros.infrastructure.messaging.PagamentoLiquidadoConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PagamentoLiquidadoConsumerTest {

    @Mock
    private SinistroRepository repository;

    @Mock
    private DashboardCacheInvalidator cacheInvalidator;

    @InjectMocks
    private PagamentoLiquidadoConsumer consumer;

    @BeforeEach
    @AfterEach
    void cleanup() {
        MDC.clear();
    }

    @Test
    void deveConsumirEventoComCorrelationIdEAtualizarStatusParaPago() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        PagamentoLiquidadoEvent event = new PagamentoLiquidadoEvent(
                sinistroId, seguradoId, new BigDecimal("3500.00"), "PROCESSADO"
        );

        RecordHeaders headers = new RecordHeaders();
        headers.add("X-Correlation-Id", "corr-sinistro-123".getBytes(StandardCharsets.UTF_8));
        ConsumerRecord<String, PagamentoLiquidadoEvent> record = new ConsumerRecord<>(
                "pagamento.liquidado", 0, 10L, 0L, null, 0, 0,
                sinistroId.toString(), event, headers, Optional.empty()
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.APROVADO);
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));

        consumer.consumir(record);

        verify(repository).salvar(sinistro);
        verify(cacheInvalidator).invalidar();
        assertEquals(Status.PAGO, sinistro.getStatus());
        assertNull(MDC.get("correlationId"), "MDC deve ser limpo no finally");
    }

    @Test
    void deveConsumirEventoSemHeaderEGerarCorrelationIdNoMdc() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        PagamentoLiquidadoEvent event = new PagamentoLiquidadoEvent(
                sinistroId, seguradoId, new BigDecimal("3500.00"), "PROCESSADO"
        );

        ConsumerRecord<String, PagamentoLiquidadoEvent> record = new ConsumerRecord<>(
                "pagamento.liquidado", 0, 10L, sinistroId.toString(), event
        );

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setStatus(Status.APROVADO);
        when(repository.buscarPorId(sinistroId)).thenReturn(Optional.of(sinistro));

        consumer.consumir(record);

        verify(repository).salvar(sinistro);
        assertNull(MDC.get("correlationId"), "MDC deve ser limpo no finally");
    }

    @Test
    void naoDeveAtualizarStatusQuandoPagamentoFalhar() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        PagamentoLiquidadoEvent event = new PagamentoLiquidadoEvent(
                sinistroId, seguradoId, new BigDecimal("3500.00"), "FALHA"
        );

        ConsumerRecord<String, PagamentoLiquidadoEvent> record = new ConsumerRecord<>(
                "pagamento.liquidado", 0, 10L, sinistroId.toString(), event
        );

        consumer.consumir(record);

        verifyNoInteractions(repository);
        verifyNoInteractions(cacheInvalidator);
        assertNull(MDC.get("correlationId"));
    }
}
