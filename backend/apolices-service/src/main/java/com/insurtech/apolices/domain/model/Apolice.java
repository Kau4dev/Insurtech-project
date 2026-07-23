package com.insurtech.apolices.domain.model;

import com.insurtech.apolices.domain.exception.StatusApoliceInvalidoException;
import com.insurtech.apolices.domain.exception.TipoCoberturaIncompativelException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class Apolice {

    private UUID id;
    private UUID seguradoId;
    private String numeroApolice;
    private TipoSeguro tipoSeguro;
    private BigDecimal valorSeguro;
    private BigDecimal valorPremio;
    private LocalDate dataInicioVigencia;
    private LocalDate dataFimVigencia;
    private Status status;
    private List<Cobertura> coberturas = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public boolean isVigente(){
        LocalDate hoje = LocalDate.now();
        return Status.ATIVA.equals(this.status)
                && !hoje.isBefore(dataInicioVigencia)
                && !hoje.isAfter(dataFimVigencia);
    }

    public void cancelar(){
        if(Status.CANCELADA.equals(this.status)) {
            throw new StatusApoliceInvalidoException("Apolice já está cancelada");
        }
        if(Status.EXPIRADA.equals(this.status)){
            throw new StatusApoliceInvalidoException("Apólice expirada não pode ser cancelada");
        }
        this.status = Status.CANCELADA;
        this.updatedAt = Instant.now();
    }

    public void suspender(){
        if(!Status.ATIVA.equals(this.status)) {
            throw new StatusApoliceInvalidoException("Apenas apólices ativas podem ser suspensas");
        }
        this.status = Status.SUSPENSA;
        this.updatedAt = Instant.now();
    }

    public void reativar(){
        if(!Status.SUSPENSA.equals(this.status)) {
            throw new StatusApoliceInvalidoException("Apenas apólices suspensas podem ser reativadas");
        }
        this.status = Status.ATIVA;
        this.updatedAt = Instant.now();
    }

    public void adicionarCobertura(Cobertura cobertura) {
        cobertura.validar();
        if (!cobertura.getTipoCobertura().compativel(this.tipoSeguro)) {
            throw new TipoCoberturaIncompativelException(
                "Cobertura " + cobertura.getTipoCobertura() +
                " não é compatível com apólice do tipo " + this.tipoSeguro
            );
        }
        cobertura.setApoliceId(this.id);
        this.coberturas.add(cobertura);
    }
}



