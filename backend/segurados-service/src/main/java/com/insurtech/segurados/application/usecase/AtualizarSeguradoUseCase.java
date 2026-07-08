package com.insurtech.segurados.application.usecase;

import com.insurtech.segurados.application.dto.SeguradoResponseDTO;
import com.insurtech.segurados.application.dto.SeguradoUpdateDTO;
import com.insurtech.segurados.domain.exception.SeguradoNaoEncontradoException;
import com.insurtech.segurados.domain.model.Segurado;
import com.insurtech.segurados.domain.repository.SeguradoRepository;
import com.insurtech.segurados.infrastructure.mapper.SeguradoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AtualizarSeguradoUseCase {

    private final SeguradoRepository repository;
    private final SeguradoMapper mapper;

    public SeguradoResponseDTO atualizar(UUID id, SeguradoUpdateDTO dto) {
        Segurado segurado = repository.buscarPorId(id)
                .orElseThrow(() -> new SeguradoNaoEncontradoException("Segurado não encontrado com o ID: " + id));

        segurado.setNomeRazaoSocial(dto.nomeRazaoSocial());
        segurado.setEmail(dto.email());
        segurado.setTelefone(dto.telefone());
        segurado.setDataNascimento(dto.dataNascimento());
        segurado.setEnderecoLogradouro(dto.enderecoLogradouro());
        segurado.setEnderecoCidade(dto.enderecoCidade());
        segurado.setEnderecoUf(dto.enderecoUf());
        segurado.setEnderecoCep(dto.enderecoCep());
        segurado.setUpdatedAt(Instant.now());

        Segurado atualizado = repository.salvar(segurado);
        return mapper.toResponse(atualizado);
    }
}
