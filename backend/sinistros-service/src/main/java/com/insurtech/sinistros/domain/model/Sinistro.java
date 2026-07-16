package com.insurtech.sinistros.domain.model;

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
public class Sinistro {

    private UUID id;
    private String numeroSinistro;
    private UUID apoliceId;
    private UUID seguradoId;
    private UUID analistaId;
    private TipoSinistro tipoSinistro;
    private String descricao;
    private LocalDate dataOcorrencia;
    private Instant dataRegistro;
    private BigDecimal valorEstimado;
    private BigDecimal valorAprovado;
    private Status status;
    private String motivoRejeicao;
    private Instant createdAt;
    private Instant updatedAt;


    private List<HistoricoSinistro> historico = new ArrayList<>();
    private List<DocumentoSinistro> documentos = new ArrayList<>();

    private void registrarHistorico(Status anterior,
                                    Status novo,
                                    String observacao) {
        HistoricoSinistro registro = new HistoricoSinistro();
        registro.setId(UUID.randomUUID());
        registro.setSinistroId(this.id);
        registro.setStatusAnterior(anterior);
        registro.setStatusNovo(novo);
        registro.setObservacao(observacao);
        registro.setCreatedAt(Instant.now());
        registro.validar();
        this.historico.add(registro);
    }

    public void iniciarAnalise(UUID analistaId) {
        if (!Status.REGISTRADO.equals(this.status)) {
            throw new IllegalStateException(
                    "Sinistro precisa estar REGISTRADO para iniciar análise"
            );
        }
        registrarHistorico(this.status, Status.EM_ANALISE, null);
        this.analistaId = analistaId;
        this.status = Status.EM_ANALISE;
        this.updatedAt = Instant.now();
    }

    public void aprovar(BigDecimal valorAprovado, BigDecimal valorSeguradoApolice) {
        if (!Status.EM_ANALISE.equals(this.status)) {
            throw new IllegalStateException("Sinistro precisa estar EM_ANALISE para ser aprovado");
        }
        if (valorAprovado == null || valorAprovado.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor aprovado deve ser maior que zero");
        }
        if (valorAprovado.compareTo(valorSeguradoApolice) > 0) {
            throw new IllegalArgumentException("Valor aprovado não pode exceder o valor segurado da apólice");
        }
        registrarHistorico(this.status, Status.APROVADO, null);
        this.valorAprovado = valorAprovado;
        this.status = Status.APROVADO;
        this.updatedAt = Instant.now();
    }

    public void rejeitar(String motivoRejeicao) {
        if (!Status.EM_ANALISE.equals(this.status)) {
            throw new IllegalStateException("Sinistro precisa estar EM_ANALISE para ser rejeitado");
        }
        if (motivoRejeicao == null || motivoRejeicao.isBlank()) {
            throw new IllegalArgumentException("Motivo de rejeição é obrigatório");
        }
        registrarHistorico(this.status, Status.REJEITADO, motivoRejeicao);
        this.motivoRejeicao = motivoRejeicao;
        this.status = Status.REJEITADO;
        this.updatedAt = Instant.now();
    }

    public void aguardarDocumentos() {
        if (!Status.EM_ANALISE.equals(this.status)) {
            throw new IllegalStateException(
                    "Sinistro precisa estar EM_ANALISE para aguardar documentos"
            );
        }
        registrarHistorico(this.status, Status.AGUARDANDO_DOCUMENTOS, null);
        this.status = Status.AGUARDANDO_DOCUMENTOS;
        this.updatedAt = Instant.now();
    }

    public void adicionarDocumento(DocumentoSinistro documento) {
        documento.setSinistroId(this.id);
        documento.setDataUpload(Instant.now());
        documento.validar();
        this.documentos.add(documento);
    }

    public void marcarComoPago() {
        if (!Status.APROVADO.equals(this.status)) {
            throw new IllegalStateException(
                    "Sinistro precisa estar APROVADO para ser marcado como PAGO"
            );
        }
        registrarHistorico(this.status, Status.PAGO, null);
        this.status = Status.PAGO;
        this.updatedAt = Instant.now();
    }


}
