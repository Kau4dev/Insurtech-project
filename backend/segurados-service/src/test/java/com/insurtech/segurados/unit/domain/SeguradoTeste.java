package com.insurtech.segurados.unit.domain;

import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.domain.exception.AtributoInvalidoPessoaJuridicaException;
import com.insurtech.segurados.domain.exception.DataNascimentoObrigatoriaException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.model.TipoPessoa;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class SeguradoTeste {

    @Test
    void deveLancarExcecao_quandoPF_semDataNascimento() {
        Segurado segurado = new Segurado();
        segurado.setTipoPessoa(TipoPessoa.PF);
        segurado.setDataNascimento(null);

        assertThrows(DataNascimentoObrigatoriaException.class, segurado::validar);
    }

    @Test
    void deveValidar_quandoPF_comDataNascimento() {
        Segurado segurado = new Segurado();
        segurado.setTipoPessoa(TipoPessoa.PF);
        segurado.setDataNascimento(LocalDate.of(1990, 5, 15));

        assertDoesNotThrow(segurado::validar);
    }

    @Test
    void deveLancarExcecao_quandoPJ_comDataNascimento() {
        Segurado segurado = new Segurado();
        segurado.setTipoPessoa(TipoPessoa.PJ);
        segurado.setDataNascimento(LocalDate.of(1990, 5, 15));

        assertThrows(AtributoInvalidoPessoaJuridicaException.class, segurado::validar);
    }

    @Test
    void deveAtualizar_apenasOsCamposInformados() {
        Segurado segurado = new Segurado();
        segurado.setNomeRazaoSocial("Nome Antigo");
        segurado.setEmail("antigo@email.com");
        segurado.setTelefone("11912345678");

        SeguradoUpdateDTO dto = new SeguradoUpdateDTO(
                "Nome Novo", null, null, null, null, null, null, null
        );

        segurado.atualizar(dto);

        assertEquals("Nome Novo", segurado.getNomeRazaoSocial());
        assertEquals("antigo@email.com", segurado.getEmail()); // não mudou
        assertEquals("11912345678", segurado.getTelefone());   // não mudou
    }
}
