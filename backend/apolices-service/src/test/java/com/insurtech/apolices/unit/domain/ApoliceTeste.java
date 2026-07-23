package com.insurtech.apolices.unit.domain;

import com.insurtech.apolices.domain.exception.StatusApoliceInvalidoException;
import com.insurtech.apolices.domain.exception.TipoCoberturaIncompativelException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Cobertura;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoCobertura;
import com.insurtech.apolices.domain.model.TipoSeguro;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class ApoliceTeste {

    @Test
    void deveRetornarVigente_quandoDentroDoPrazo_eAtiva() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);
        apolice.setDataInicioVigencia(LocalDate.now().minusDays(1));
        apolice.setDataFimVigencia(LocalDate.now().plusDays(1));

        assertTrue(apolice.isVigente());
    }

    @Test
    void deveRetornarNaoVigente_quandoForaDoPrazo() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);
        apolice.setDataInicioVigencia(LocalDate.now().plusDays(1));
        apolice.setDataFimVigencia(LocalDate.now().plusDays(10));

        assertFalse(apolice.isVigente());
    }

    @Test
    void deveLancarExcecao_quandoCancelarApoliceJaCancelada() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.CANCELADA);

        assertThrows(StatusApoliceInvalidoException.class, apolice::cancelar);
    }

    @Test
    void deveLancarExcecao_quandoCancelarApoliceExpirada() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.EXPIRADA);

        assertThrows(StatusApoliceInvalidoException.class, apolice::cancelar);
    }

    @Test
    void deveCancelarApoliceComSucesso() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);

        assertDoesNotThrow(apolice::cancelar);
        assertEquals(Status.CANCELADA, apolice.getStatus());
        assertNotNull(apolice.getUpdatedAt());
    }

    @Test
    void deveLancarExcecao_quandoSuspenderApoliceCancelada() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.CANCELADA);
        
        assertThrows(StatusApoliceInvalidoException.class, apolice::suspender);
    }

    @Test
    void deveSuspenderApoliceAtivaComSucesso() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);
        
        assertDoesNotThrow(apolice::suspender);
        assertEquals(Status.SUSPENSA, apolice.getStatus());
    }

    @Test
    void deveLancarExcecao_quandoReativarApoliceAtiva() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);

        assertThrows(StatusApoliceInvalidoException.class, apolice::reativar);
    }

    @Test
    void deveReativarApoliceSuspensaComSucesso() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.SUSPENSA);

        assertDoesNotThrow(apolice::reativar);
        assertEquals(Status.ATIVA, apolice.getStatus());
    }

    @Test
    void deveAdicionarCobertura_comSucesso() {
        Apolice apolice = new Apolice();
        apolice.setId(UUID.randomUUID());
        apolice.setTipoSeguro(TipoSeguro.AUTO);
        
        Cobertura cobertura = new Cobertura();
        cobertura.setTipoCobertura(TipoCobertura.COLISAO);
        cobertura.setValorCobertura(new java.math.BigDecimal("1000.00"));

        apolice.adicionarCobertura(cobertura);

        assertEquals(1, apolice.getCoberturas().size());
        assertEquals(apolice.getId(), apolice.getCoberturas().get(0).getApoliceId());
    }

    @Test
    void deveLancarExcecao_quandoAdicionarCoberturaIncompativel() {
        Apolice apolice = new Apolice();
        apolice.setId(UUID.randomUUID());
        apolice.setTipoSeguro(TipoSeguro.VIDA);
        
        Cobertura cobertura = new Cobertura();
        cobertura.setTipoCobertura(TipoCobertura.COLISAO);
        cobertura.setValorCobertura(new java.math.BigDecimal("1000.00"));

        assertThrows(TipoCoberturaIncompativelException.class, () -> apolice.adicionarCobertura(cobertura));
    }
}
