package com.insurtech.sinistros.infrastructure.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DashboardCacheInvalidator {

    private final CacheManager cacheManager;

    public void invalidar() {
        var cache = cacheManager.getCache("dashboardMetricas");
        if (cache != null) {
            cache.clear();
            log.debug("Cache 'dashboardMetricas' limpo com sucesso.");
        }
    }
}