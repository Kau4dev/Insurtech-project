package com.insurtech.sinistros.application.usecase;

import com.insurtech.sinistros.application.dto.request.AdicionarDocumentoRequestDTO;
import com.insurtech.sinistros.application.dto.response.DocumentoSinistroResponseDTO;
import com.insurtech.sinistros.application.validator.SinistroSecurityValidator;
import com.insurtech.sinistros.domain.exception.SinistroNaoEncontradoException;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.domain.repository.SinistroRepository;
import com.insurtech.sinistros.infrastructure.mapper.SinistroMapper;
import com.insurtech.sinistros.infrastructure.security.UserContext;
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
    private final SinistroSecurityValidator securityValidator;

    public DocumentoSinistroResponseDTO executar(UUID id, AdicionarDocumentoRequestDTO dto) {
        UserContext ctx = securityValidator.validarAutenticacao();

        Sinistro sinistro = repository.buscarPorId(id)
                .orElseThrow(() -> new SinistroNaoEncontradoException("Sinistro não encontrado com o ID: " + id));

        securityValidator.validarPropriedadeSegurado(
                sinistro.getSeguradoId(),
                "Acesso negado. Você só pode adicionar documentos aos seus próprios sinistros."
        );

        DocumentoSinistro documento = new DocumentoSinistro();
        documento.setId(UUID.randomUUID());
        documento.setNomeArquivo(dto.nomeArquivo());
        documento.setTipoDocumento(dto.tipoDocumento());
        documento.setUrlArquivo(dto.urlArquivo());

        sinistro.adicionarDocumento(documento, UUID.fromString(ctx.getUsuarioId()));
        repository.salvar(sinistro);

        return mapper.toResponse(documento);
    }
}