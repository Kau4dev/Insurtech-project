package com.insurtech.apolices.domain.model;

import java.util.Set;

public enum TipoCobertura {

    COLISAO(TipoSeguro.AUTO),
    ROUBO_FURTO(TipoSeguro.AUTO),
    INCENDIO_VEICULO(TipoSeguro.AUTO),
    DANO_A_TERCEIRO(TipoSeguro.AUTO),
    QUEBRA_DE_VIDRO(TipoSeguro.AUTO),

    INCENDIO_RESIDENCIAL(TipoSeguro.RESIDENCIAL),
    DANOS_ELETRICOS(TipoSeguro.RESIDENCIAL),
    ROUBO_BENS(TipoSeguro.RESIDENCIAL),
    ALAGAMENTO(TipoSeguro.RESIDENCIAL),

    MORTE(TipoSeguro.VIDA),
    INVALIDEZ_PERMANENTE(TipoSeguro.VIDA),
    DOENCA_GRAVE(TipoSeguro.VIDA),

    DANO_EQUIPAMENTO(TipoSeguro.PATRIMONIAL, TipoSeguro.EMPRESARIAL),
    LUCROS_CESSANTES(TipoSeguro.EMPRESARIAL),
    RESPONSABILIDADE_CIVIL(TipoSeguro.RESIDENCIAL, TipoSeguro.EMPRESARIAL),

    OUTROS(TipoSeguro.values()); // compatível com todos

    private final Set<TipoSeguro> tiposSeguradoCompativeis;

    TipoCobertura(TipoSeguro... tipos) {
        this.tiposSeguradoCompativeis = Set.of(tipos);
    }

    public boolean compativel(TipoSeguro tipoSeguro) {
        return tiposSeguradoCompativeis.contains(tipoSeguro);
    }
}
