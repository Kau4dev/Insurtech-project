package com.insurtech.sinistros.application.usecase;


import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.AnalistaInvalidoException;
import com.insurtech.sinistros.domain.exception.AnalistaNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.AuthClient;
import com.insurtech.sinistros.infrastructure.client.dto.Papel;
import com.insurtech.sinistros.infrastructure.client.dto.UsuarioResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Transactional
@Service
@RequiredArgsConstructor
public class AtribuirAnalistaUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final AuthClient authClient;

    public SinistroResponseDTO executar(UUID sinistroId, UUID analistaId, String usuarioId, String usuarioPapel) {
        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas gestores ou administradores podem atribuir analistas.");
        }

        validarAnalista(analistaId);

        Sinistro sinistro = repository.buscarPorId(sinistroId)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + sinistroId));

        sinistro.iniciarAnalise(analistaId);

        return mapper.toResponse(repository.salvar(sinistro));
    }

    private void validarAnalista(UUID analistaId) {
        UsuarioResponseDTO analista;
        try {
            analista = authClient.buscarPorId(analistaId);
        } catch (FeignException.NotFound e) {
            throw new AnalistaNaoEncontradoException("Analista não encontrado com o ID: " + analistaId);
        }

        if (analista == null || !List.of(Papel.ANALISTA, Papel.GESTOR).contains(analista.papel())) {
            throw new AnalistaInvalidoException("O usuário informado não possui papel de analista (ANALISTA ou GESTOR)");
        }
    }
}
