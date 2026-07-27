package com.insurtech.liquidacao.infrastructure.config;

import com.insurtech.liquidacao.application.dto.SinistroAprovadoEventDTO;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.kafka.KafkaConnectionDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    private final KafkaConnectionDetails kafkaConnectionDetails;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    public KafkaConsumerConfig(KafkaConnectionDetails kafkaConnectionDetails) {
        this.kafkaConnectionDetails = kafkaConnectionDetails;
    }

    @Bean
    public ConsumerFactory<String, SinistroAprovadoEventDTO> consumerFactory() {
        JsonDeserializer<SinistroAprovadoEventDTO> deserializer =
                new JsonDeserializer<>(SinistroAprovadoEventDTO.class, false);
        deserializer.addTrustedPackages("*");

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaConnectionDetails.getConsumerBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SinistroAprovadoEventDTO>
    kafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, SinistroAprovadoEventDTO> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());

        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                (record, exception) ->
                        org.slf4j.LoggerFactory.getLogger(KafkaConsumerConfig.class)
                                .error("Mensagem descartada apos 3 tentativas. topic={}, offset={}, erro={}",
                                        record.topic(), record.offset(), exception.getMessage()),
                new FixedBackOff(1000L, 3L)
        );
        factory.setCommonErrorHandler(errorHandler);

        return factory;
    }
}
