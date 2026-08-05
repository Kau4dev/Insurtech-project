package com.insurtech.apolices.application.usecase;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.AtualizarStatusApoliceDTO;
import com.insurtech.apolices.domain.exception.AcessoNegadoException;
import com.insurtech.apolices.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.apolices.domain.exception.StatusNaoSuportadoException;
import com.insurtech.apolices.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import com.insurtech.apolices.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Transactional
@Service
@RequiredArgsConstructor
public class AtualizarStatusApoliceUseCase {

    private final ApoliceRepository repository;
    private final ApoliceMapper mapper;

    public ApoliceResponseDTO executar(UUID id, AtualizarStatusApoliceDTO novoStatus) throws StatusNaoSuportadoException {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas gestores ou administradores podem atualizar o status de apólices.");
        }

        Apolice apolice = repository.buscarPorId(id)
                .orElseThrow(() -> new ApoliceNaoEncontradaException("Apólice não encontrada com ID: " + id));

        switch (novoStatus.status()) {
            case CANCELADA -> apolice.cancelar();
            case SUSPENSA -> apolice.suspender();
            case ATIVA -> apolice.reativar();
            default -> throw new StatusNaoSuportadoException("Status não suportado para atualização manual: " + novoStatus);
        }

        repository.salvar(apolice);

        return mapper.toResponse(apolice);
    }
}