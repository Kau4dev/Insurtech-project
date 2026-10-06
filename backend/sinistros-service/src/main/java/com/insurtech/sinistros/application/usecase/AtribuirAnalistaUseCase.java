package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.AnalistaInvalidoException;
import com.insurtech.sinistros.domain.exception.AnalistaNaoEncontradoException;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.client.AuthClient;
import com.insurtech.sinistros.infrastructure.client.dto.Papel;
import com.insurtech.sinistros.infrastructure.client.dto.UsuarioResponseDTO;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
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
    private final SinistroSecurityValidator securityValidator;

    public SinistroResponseDTO executar(UUID sinistroId, UUID analistaId) {
        UserContext ctx = securityValidator.validarPapeis(
                "Acesso negado. Apenas analistas, gestores ou administradores podem atribuir analistas.",
                "ANALISTA", "GESTOR", "ADMIN"
        );

        if ("ANALISTA".equals(ctx.getUsuarioPapel()) && !ctx.getUsuarioId().equals(analistaId.toString())) {
            throw new AcessoNegadoException("Acesso negado. Analistas só podem se auto-atribuir a sinistros.");
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
