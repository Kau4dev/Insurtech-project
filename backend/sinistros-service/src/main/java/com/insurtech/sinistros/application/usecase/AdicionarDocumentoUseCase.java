package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.response.DocumentoSinistroResponseDTO;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
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
public class AdicionarDocumentoUseCase {

    private final SinistroRepository repository;
    private final SinistroMapper mapper;

    public DocumentoSinistroResponseDTO executar(UUID id, AdicionarDocumentoRequestDTO dto) {

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Sinistro não encontrado com o ID: " + id));

        DocumentoSinistro documento = new DocumentoSinistro();
        documento.setId(UUID.randomUUID());
        documento.setNomeArquivo(dto.nomeArquivo());
        documento.setTipoDocumento(dto.tipoDocumento());
        documento.setUrlArquivo(dto.urlArquivo());
        
        String actingUser = UserContextHolder.getContext().getUsuarioId();
        UUID usuarioId = (actingUser != null && !actingUser.isBlank()) ? UUID.fromString(actingUser) : null;

        sinistro.adicionarDocumento(documento, usuarioId);
        repository.salvar(sinistro);
        
        return mapper.toResponse(documento);
    }

}