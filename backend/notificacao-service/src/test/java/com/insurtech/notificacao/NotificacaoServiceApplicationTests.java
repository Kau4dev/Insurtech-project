package com.insurtech.notificacao;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(partitions = 1)
@ActiveProfiles("test")
class NotificacaoServiceApplicationTests {

	@Test
	@DisplayName("Deve carregar o contexto da aplicação com sucesso")
	void contextLoads() {
	}

}
