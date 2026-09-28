package com.insurtech.sinistros.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {

        RedisCacheConfiguration configPadrao = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new
                                GenericJackson2JsonRedisSerializer())
                );

        Map<String, RedisCacheConfiguration> cachesPersonalizados = new HashMap<>();

        cachesPersonalizados.put("seguradosCache", configPadrao.entryTtl(Duration.ofMinutes(30)));

        cachesPersonalizados.put("apolicesCache", configPadrao.entryTtl(Duration.ofHours(1)));

        cachesPersonalizados.put("dashboardMetricas", configPadrao.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(configPadrao)
                .withInitialCacheConfigurations(cachesPersonalizados)
                .build();
    }
}