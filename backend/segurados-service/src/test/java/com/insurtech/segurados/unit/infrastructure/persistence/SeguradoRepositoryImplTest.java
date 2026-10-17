package com.insurtech.segurados.unit.infrastructure.persistence;

import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import com.insurtech.segurados.infrastructure.persistence.SeguradoJpaEntity;
import com.insurtech.segurados.infrastructure.persistence.SeguradoJpaRepository;
import com.insurtech.segurados.infrastructure.persistence.SeguradoRepositoryImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeguradoRepositoryImplTest {

    @Mock
    private SeguradoJpaRepository jpaRepository;

    @Mock
    private SeguradoMapper mapper;

    @InjectMocks
    private SeguradoRepositoryImpl repository;

    @Test
    @DisplayName("Deve listar todos os segurados com paginação quando termo de busca for nulo")
    void deveListarTodos_quandoNomeForNulo() {
        Pageable pageable = PageRequest.of(0, 10);
        SeguradoJpaEntity entity = new SeguradoJpaEntity();
        Segurado segurado = new Segurado();

        Page<SeguradoJpaEntity> pageEntity = new PageImpl<>(Collections.singletonList(entity));
        when(jpaRepository.findAll(pageable)).thenReturn(pageEntity);
        when(mapper.toDomain(entity)).thenReturn(segurado);

        Page<Segurado> resultado = repository.listar(null, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getContent().size());
        verify(jpaRepository, times(1)).findAll(pageable);
        verify(jpaRepository, never()).findByNomeRazaoSocialContainingIgnoreCase(any(), any());
    }

    @Test
    @DisplayName("Deve listar todos os segurados com paginação quando termo de busca for em branco")
    void deveListarTodos_quandoNomeForEmBranco() {
        Pageable pageable = PageRequest.of(0, 10);
        SeguradoJpaEntity entity = new SeguradoJpaEntity();
        Segurado segurado = new Segurado();

        Page<SeguradoJpaEntity> pageEntity = new PageImpl<>(Collections.singletonList(entity));
        when(jpaRepository.findAll(pageable)).thenReturn(pageEntity);
        when(mapper.toDomain(entity)).thenReturn(segurado);

        Page<Segurado> resultado = repository.listar("   ", pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getContent().size());
        verify(jpaRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Deve listar segurados filtrando por nome quando termo de busca não contiver dígitos")
    void deveListarPorNome_quandoNomeNaoConterDigitos() {
        Pageable pageable = PageRequest.of(0, 10);
        SeguradoJpaEntity entity = new SeguradoJpaEntity();
        Segurado segurado = new Segurado();

        Page<SeguradoJpaEntity> pageEntity = new PageImpl<>(Collections.singletonList(entity));
        when(jpaRepository.findByNomeRazaoSocialContainingIgnoreCase("João", pageable)).thenReturn(pageEntity);
        when(mapper.toDomain(entity)).thenReturn(segurado);

        Page<Segurado> resultado = repository.listar("João", pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getContent().size());
        verify(jpaRepository, times(1)).findByNomeRazaoSocialContainingIgnoreCase("João", pageable);
    }

    @Test
    @DisplayName("Deve listar segurados filtrando por nome ou CPF/CNPJ quando termo contiver dígitos")
    void deveListarPorNomeOuCpfCnpj_quandoConterDigitos() {
        Pageable pageable = PageRequest.of(0, 10);
        SeguradoJpaEntity entity = new SeguradoJpaEntity();
        Segurado segurado = new Segurado();

        Page<SeguradoJpaEntity> pageEntity = new PageImpl<>(Collections.singletonList(entity));
        when(jpaRepository.findByNomeRazaoSocialContainingIgnoreCaseOrCpfCnpjContaining("123.456.789-00", "12345678900", pageable))
                .thenReturn(pageEntity);
        when(mapper.toDomain(entity)).thenReturn(segurado);

        Page<Segurado> resultado = repository.listar("123.456.789-00", pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getContent().size());
        verify(jpaRepository, times(1))
                .findByNomeRazaoSocialContainingIgnoreCaseOrCpfCnpjContaining("123.456.789-00", "12345678900", pageable);
    }

    @Test
    @DisplayName("Deve buscar segurado por usuarioId com sucesso")
    void deveBuscarPorUsuarioId_comSucesso() {
        UUID usuarioId = UUID.randomUUID();
        SeguradoJpaEntity entity = new SeguradoJpaEntity();
        Segurado segurado = new Segurado();

        when(jpaRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(entity));
        when(mapper.toDomain(entity)).thenReturn(segurado);

        Optional<Segurado> resultado = repository.buscarPorUsuarioId(usuarioId);

        assertTrue(resultado.isPresent());
        verify(jpaRepository, times(1)).findByUsuarioId(usuarioId);
    }
}

