package com.insurtech.sinistros.unit.domain;

import com.insurtech.sinistros.domain.exception.DocumentoObrigatorioException;
import com.insurtech.sinistros.domain.exception.StatusInvalidoException;
import com.insurtech.sinistros.domain.exception.ValorInvalidoException;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.model.Status;
import com.insurtech.sinistros.domain.model.TipoDocumento;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class SinistroTeste {

    @Test
    void deveAprovarSinistro_comSucesso() {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setStatus(Status.EM_ANALISE);
        
        DocumentoSinistro doc = new DocumentoSinistro();
        doc.setId(UUID.randomUUID());
        doc.setTipoDocumento(TipoDocumento.BOLETIM_OCORRENCIA);
        doc.setNomeArquivo("bo.pdf");
        doc.setUrlArquivo("http://s3/bo.pdf");
        sinistro.adicionarDocumento(doc);

        assertDoesNotThrow(() -> sinistro.aprovar(new BigDecimal("1000.00"), new BigDecimal("5000.00")));
        assertEquals(Status.APROVADO, sinistro.getStatus());
        assertEquals(new BigDecimal("1000.00"), sinistro.getValorAprovado());
    }

    @Test
    void deveLancarExcecao_quandoAprovarSinistroSemDocumentos() {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setStatus(Status.EM_ANALISE);

        assertThrows(DocumentoObrigatorioException.class, 
            () -> sinistro.aprovar(new BigDecimal("1000.00"), new BigDecimal("5000.00")));
    }

    @Test
    void deveLancarExcecao_quandoAprovarSinistroComStatusInvalido() {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setStatus(Status.REGISTRADO); // Não está EM_ANALISE
        
        assertThrows(StatusInvalidoException.class, 
            () -> sinistro.aprovar(new BigDecimal("1000.00"), new BigDecimal("5000.00")));
    }

    @Test
    void deveLancarExcecao_quandoAprovarValorMaiorQueApolice() {
        Sinistro sinistro = new Sinistro();
        sinistro.setId(UUID.randomUUID());
        sinistro.setStatus(Status.EM_ANALISE);
        
        assertThrows(ValorInvalidoException.class, 
            () -> sinistro.aprovar(new BigDecimal("6000.00"), new BigDecimal("5000.00")));
    }
}
