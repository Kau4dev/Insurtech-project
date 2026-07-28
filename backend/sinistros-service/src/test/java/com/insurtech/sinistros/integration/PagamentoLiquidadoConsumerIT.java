package com.insurtech.sinistros.integration;

import com.insurtech.sinistros.domain.event.PagamentoLiquidadoEvent;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.util.UUID;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class PagamentoLiquidadoConsumerIT extends IntegrationTestBase {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private SinistroRepository repository;

    @Test
    void deveMarcarComoPagoQuandoReceberEventoPagamentoLiquidadoComSucesso() {
        // Arrange
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        BigDecimal valorLiquidado = new BigDecimal("4500.00");

        Sinistro sinistro = new Sinistro();
        sinistro.setId(sinistroId);
        sinistro.setNumeroSinistro("SIN-TEST-KAFKA-CONSUMER");
        sinistro.setApoliceId(UUID.randomUUID());
        sinistro.setSeguradoId(seguradoId);
        sinistro.setAnalistaId(UUID.randomUUID());
        sinistro.setTipoSinistro(TipoSinistro.ROUBO_FURTO);
        sinistro.setDescricao("Sinistro aprovado a ser pago no teste");
        sinistro.setDataOcorrencia(LocalDate.now());
        sinistro.setValorEstimado(valorLiquidado);
        sinistro.setValorAprovado(valorLiquidado);
        sinistro.setStatus(Status.APROVADO);

        repository.salvar(sinistro);

        PagamentoLiquidadoEvent event = new PagamentoLiquidadoEvent(
                sinistroId,
                seguradoId,
                valorLiquidado,
                "PROCESSADO"
        );

        // Act
        kafkaTemplate.send("pagamento.liquidado", sinistroId.toString(), event);

        // Assert
        await()
                .atMost(Duration.ofSeconds(10))
                .pollInterval(Duration.ofMillis(200))
                .untilAsserted(() -> {
                    Sinistro updatedSinistro = repository.buscarPorId(sinistroId).orElse(null);
                    assertNotNull(updatedSinistro, "Sinistro deveria existir no banco");
                    assertEquals(Status.PAGO, updatedSinistro.getStatus(), "Status deveria ter sido atualizado para PAGO");
                });
    }
}
