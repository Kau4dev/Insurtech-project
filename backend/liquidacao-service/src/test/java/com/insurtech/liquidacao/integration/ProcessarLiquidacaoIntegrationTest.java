package com.insurtech.liquidacao.integration;

import com.insurtech.liquidacao.infrastructure.persistence.EventoPagamentoJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.kafka.core.KafkaTemplate;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.util.UUID;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
// Removido o @Testcontainers para deixar o Spring Boot gerenciar nativamente via ServiceConnection
class ProcessarLiquidacaoIntegrationTest {

    @Container
    @ServiceConnection // Conecta automaticamente o DataSource do Spring ao Postgres do Docker
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Container
    @ServiceConnection // Conecta automaticamente o bootstrap-servers do Spring ao Kafka do Docker
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.1"));

    static {
        // Inicializa os contêineres manualmente de forma estática para garantir estabilidade
        postgres.start();
        kafka.start();
    }

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private EventoPagamentoJpaRepository repository;

    @Test
    void deveProcessarLiquidacaoEGravarNoBancoQuandoReceberEventoKafka() {
        UUID sinistroId = UUID.randomUUID();
        UUID seguradoId = UUID.randomUUID();
        String eventoIdOrigem = UUID.randomUUID().toString();

        String jsonPayload = String.format("""
            {
                "sinistroId": "%s",
                "seguradoId": "%s",
                "valorAprovado": 2500.00,
                "eventoIdOrigem": "%s"
            }
            """, sinistroId, seguradoId, eventoIdOrigem);

        kafkaTemplate.send("sinistro.aprovado", sinistroId.toString(), jsonPayload);

        await()
                .atMost(Duration.ofSeconds(10))
                .pollInterval(Duration.ofMillis(200))
                .untilAsserted(() -> {
                    boolean existeNoBanco = repository.findAll().stream()
                            .anyMatch(p -> p.getSinistroId().equals(sinistroId) && "PROCESSADO".equals(p.getStatus().name()));

                    assertTrue(existeNoBanco, "O pagamento esperado ainda não foi processado com sucesso no banco.");
                });
    }
}
