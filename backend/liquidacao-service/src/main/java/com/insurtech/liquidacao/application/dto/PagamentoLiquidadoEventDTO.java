package com.insurtech.liquidacao.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PagamentoLiquidadoEventDTO(
        UUID sinistroId,
        UUID seguradoId,
        BigDecimal valorLiquidado,
        String status
){}
