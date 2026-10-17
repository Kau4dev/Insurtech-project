package com.insurtech.apolices.unit.domain;

import com.insurtech.apolices.domain.exception.StatusApoliceInvalidoException;
import com.insurtech.apolices.domain.exception.TipoCoberturaIncompativelException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Cobertura;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoCobertura;
import com.insurtech.apolices.domain.model.TipoSeguro;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class ApoliceTeste {

    @Test
    @DisplayName("Deve retornar vigente quando a apólice estiver ativa e dentro do período de vigência")
    void deveRetornarVigente_quandoDentroDoPrazo_eAtiva() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);
        apolice.setDataInicioVigencia(LocalDate.now().minusDays(1));
        apolice.setDataFimVigencia(LocalDate.now().plusDays(1));

        assertTrue(apolice.isVigente());
    }

    @Test
    @DisplayName("Deve retornar não vigente quando a apólice estiver fora do período de vigência")
    void deveRetornarNaoVigente_quandoForaDoPrazo() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);
        apolice.setDataInicioVigencia(LocalDate.now().plusDays(1));
        apolice.setDataFimVigencia(LocalDate.now().plusDays(10));

        assertFalse(apolice.isVigente());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar cancelar apólice que já está cancelada")
    void deveLancarExcecao_quandoCancelarApoliceJaCancelada() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.CANCELADA);

        assertThrows(StatusApoliceInvalidoException.class, apolice::cancelar);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar cancelar apólice expirada")
    void deveLancarExcecao_quandoCancelarApoliceExpirada() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.EXPIRADA);

        assertThrows(StatusApoliceInvalidoException.class, apolice::cancelar);
    }

    @Test
    @DisplayName("Deve cancelar apólice ativa com sucesso e atualizar timestamp")
    void deveCancelarApoliceComSucesso() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);

        assertDoesNotThrow(apolice::cancelar);
        assertEquals(Status.CANCELADA, apolice.getStatus());
        assertNotNull(apolice.getUpdatedAt());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar suspender apólice cancelada")
    void deveLancarExcecao_quandoSuspenderApoliceCancelada() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.CANCELADA);
        
        assertThrows(StatusApoliceInvalidoException.class, apolice::suspender);
    }

    @Test
    @DisplayName("Deve suspender apólice ativa com sucesso")
    void deveSuspenderApoliceAtivaComSucesso() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);
        
        assertDoesNotThrow(apolice::suspender);
        assertEquals(Status.SUSPENSA, apolice.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar reativar apólice que já está ativa")
    void deveLancarExcecao_quandoReativarApoliceAtiva() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.ATIVA);

        assertThrows(StatusApoliceInvalidoException.class, apolice::reativar);
    }

    @Test
    @DisplayName("Deve reativar apólice suspensa com sucesso")
    void deveReativarApoliceSuspensaComSucesso() {
        Apolice apolice = new Apolice();
        apolice.setStatus(Status.SUSPENSA);

        assertDoesNotThrow(apolice::reativar);
        assertEquals(Status.ATIVA, apolice.getStatus());
    }

    @Test
    @DisplayName("Deve adicionar cobertura à apólice com sucesso quando compatível")
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
    @DisplayName("Deve lançar exceção ao tentar adicionar cobertura incompatível com o tipo de seguro")
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
