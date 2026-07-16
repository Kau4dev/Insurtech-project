package com.insurtech.sinistros.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class HistoricoSinistro {

    private UUID id;
    private UUID sinistroId;
    private Status statusAnterior;
    private Status statusNovo;
    private UUID usuarioId;
    private String observacao;
    private Instant createdAt;

    public void validar() {
        if (statusNovo == null) {
            throw new IllegalArgumentException("Status novo é obrigatório");
        }
        if (statusNovo.equals(statusAnterior)) {
            throw new IllegalArgumentException(
                    "Status novo não pode ser igual ao status anterior"
            );
        }
        if (sinistroId == null) {
            throw new IllegalArgumentException("ID do sinistro é obrigatório");
        }
    }
}
