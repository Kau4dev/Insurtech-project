package com.insurtech.apolices.domain.model;

import com.insurtech.apolices.domain.exception.FranquiaExcedeCoberturaException;
import com.insurtech.apolices.domain.exception.ValorCoberturaInvalidoException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Cobertura {

    private UUID id;
    private UUID apoliceId;
    private String tipoCobertura;
    private BigDecimal valorCobertura;
    private BigDecimal valorFranquia;

    public void validar() {
        if (valorFranquia != null && valorFranquia.compareTo(valorCobertura) > 0) {
            throw new FranquiaExcedeCoberturaException(
                    "Valor de franquia não pode exceder o valor de cobertura"
            );
        }
        if (valorCobertura == null || valorCobertura.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValorCoberturaInvalidoException(
                    "Valor de cobertura deve ser maior que zero"
            );
        }
    }
}
