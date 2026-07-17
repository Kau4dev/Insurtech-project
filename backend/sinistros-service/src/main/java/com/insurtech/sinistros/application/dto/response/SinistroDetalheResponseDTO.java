package com.insurtech.sinistros.application.dto.response;

import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoSinistro;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SinistroDetalheResponseDTO(
        UUID id,
        String numeroSinistro,
        UUID apoliceId,
        UUID seguradoId,
        UUID analistaId,
        TipoSinistro tipoSinistro,
        String descricao,
        LocalDate dataOcorrencia,
        BigDecimal valorEstimado,
        BigDecimal valorAprovado,
        Status status,
        String motivoRejeicao,
        Instant createdAt,
        Instant updatedAt,
        List<HistoricoSinistroResponseDTO> historicos,
        List<DocumentoSinistroResponseDTO> documentos
) {
}
