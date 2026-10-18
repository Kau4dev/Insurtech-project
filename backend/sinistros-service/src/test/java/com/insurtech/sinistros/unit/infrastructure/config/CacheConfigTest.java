package com.insurtech.sinistros.unit.infrastructure.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.insurtech.sinistros.infrastructure.client.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CacheConfigTest {

    private GenericJackson2JsonRedisSerializer criarSerializer() {
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType("com.insurtech.")
                .allowIfBaseType("java.util.")
                .allowIfBaseType("java.time.")
                .allowIfBaseType("java.math.")
                .build();

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                ptv,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );

        return GenericJackson2JsonRedisSerializer.builder()
                .objectMapper(mapper)
                .build();
    }

    @Test
    @DisplayName("Deve serializar e desserializar SeguradoResponseDTO com campos Instant no Redis")
    void deveSerializarEDesserializarSeguradoResponseDTOComInstant() {
        GenericJackson2JsonRedisSerializer serializer = criarSerializer();

        SeguradoResponseDTO segurado = new SeguradoResponseDTO(
                UUID.randomUUID(),
                UUID.randomUUID(),
                TipoPessoa.PF,
                "João Silva",
                "12345678909",
                "joao@email.com",
                "11999999999",
                LocalDate.of(1990, 1, 1),
                "Rua A",
                "São Paulo",
                Uf.SP,
                "01001-000",
                Instant.now()
        );

        byte[] bytes = serializer.serialize(segurado);
        assertNotNull(bytes);

        Object deserialized = serializer.deserialize(bytes);
        assertNotNull(deserialized);
        assertTrue(deserialized instanceof SeguradoResponseDTO);
        SeguradoResponseDTO result = (SeguradoResponseDTO) deserialized;
        assertEquals(segurado.id(), result.id());
        assertEquals(segurado.nomeRazaoSocial(), result.nomeRazaoSocial());
        assertEquals(segurado.createdAt(), result.createdAt());
    }

    @Test
    @DisplayName("Deve serializar e desserializar ApoliceResponseDTO com campos Instant e LocalDate no Redis")
    void deveSerializarEDesserializarApoliceResponseDTOComInstantELocalDate() {
        GenericJackson2JsonRedisSerializer serializer = criarSerializer();

        ApoliceResponseDTO apolice = new ApoliceResponseDTO(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "AP-1020-9090",
                TipoSeguro.AUTO,
                new BigDecimal("50000.00"),
                new BigDecimal("1200.00"),
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 10, 1),
                Status.ATIVA,
                Collections.emptyList(),
                Instant.now(),
                Instant.now()
        );

        byte[] bytes = serializer.serialize(apolice);
        assertNotNull(bytes);

        Object deserialized = serializer.deserialize(bytes);
        assertNotNull(deserialized);
        assertTrue(deserialized instanceof ApoliceResponseDTO);
        ApoliceResponseDTO result = (ApoliceResponseDTO) deserialized;
        assertEquals(apolice.id(), result.id());
        assertEquals(apolice.numeroApolice(), result.numeroApolice());
        assertEquals(apolice.dataInicioVigencia(), result.dataInicioVigencia());
    }
}
