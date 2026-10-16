package com.insurtech.sinistros.application.port;

import com.insurtech.sinistros.domain.event.*;

public interface EventPublisherPort {
    void publicarSinistroRegistrado(SinistroRegistradoEvent event);
    void publicarSinistroAprovado(SinistroAprovadoEvent event);
    void publicarSinistroRejeitado(SinistroRejeitadoEvent event);
    void publicarDocumentoSolicitado(SinistroDocumentoSolicitadoEvent event);
    void publicarDocumentoAdicionado(SinistroDocumentoAdicionadoEvent event);
}