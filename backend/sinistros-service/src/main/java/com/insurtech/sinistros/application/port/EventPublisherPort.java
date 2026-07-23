package com.insurtech.sinistros.application.port;

import com.insurtech.sinistros.domain.event.SinistroAprovadoEvent;
import com.insurtech.sinistros.domain.event.SinistroRegistradoEvent;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;

public interface EventPublisherPort {
    void publicarSinistroRegistrado(SinistroRegistradoEvent event);
    void publicarSinistroAprovado(SinistroAprovadoEvent event);
    void publicarSinistroRejeitado(SinistroRejeitadoEvent event);
}