package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.RejeitarSinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.application.port.EventPublisherPort;
import com.insurtech.sinistros.domain.event.SinistroRejeitadoEvent;
import com.insurtech.sinistros.domain.exception.AcessoNegadoException;
import com.insurtech.sinistros.domain.exception.UsuarioNaoAutenticadoException;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Transactional
@Service
@RequiredArgsConstructor
public class RejeitarSinistroUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;
    private final EventPublisherPort eventPublisher;

    public SinistroResponseDTO executar(UUID id, RejeitarSinistroRequestDTO dto) {
        String usuarioId = UserContextHolder.getContext().getUsuarioId();
        String usuarioPapel = UserContextHolder.getContext().getUsuarioPapel();

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new UsuarioNaoAutenticadoException("Usuário não autenticado");
        }

        if (!"ANALISTA".equals(usuarioPapel) && !"GESTOR".equals(usuarioPapel) && !"ADMIN".equals(usuarioPapel)) {
            throw new AcessoNegadoException("Acesso negado. Apenas analistas, gestores ou administradores podem rejeitar sinistros.");
        }

        var sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Sinistro não encontrado com o ID: " + id));

        sinistro.rejeitar(dto.motivoRejeicao());
        Sinistro savedSinistro = repository.salvar(sinistro);

        eventPublisher.publicarSinistroRejeitado(new SinistroRejeitadoEvent(
                        savedSinistro.getId(),
                        savedSinistro.getSeguradoId(),
                        savedSinistro.getMotivoRejeicao()
        ));
        return mapper.toResponse(savedSinistro);
    }
}
