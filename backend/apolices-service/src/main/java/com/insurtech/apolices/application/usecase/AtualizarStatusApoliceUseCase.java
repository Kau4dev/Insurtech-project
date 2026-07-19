package com.insurtech.apolices.application.usecase;

import com.insurtech.apolices.application.dto.ApoliceResponseDTO;
import com.insurtech.apolices.application.dto.AtualizarStatusApoliceDTO;
import com.insurtech.apolices.domain.exception.ApoliceNaoEncontradaException;
import com.insurtech.apolices.domain.exception.StatusNaoSuportadoException;
import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.repository.ApoliceRepository;
import com.insurtech.apolices.infrastructure.mapper.ApoliceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AtualizarStatusApoliceUseCase {

    private final ApoliceRepository repository;
    private final ApoliceMapper mapper;

    public ApoliceResponseDTO executar(UUID id, AtualizarStatusApoliceDTO novoStatus) throws StatusNaoSuportadoException {

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