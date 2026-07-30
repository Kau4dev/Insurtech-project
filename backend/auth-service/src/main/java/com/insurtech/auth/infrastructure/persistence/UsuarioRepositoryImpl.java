package com.insurtech.auth.infrastructure.persistence;

import com.insurtech.auth.domain.model.Usuario;
import com.insurtech.auth.domain.repository.UsuarioRepository;
import com.insurtech.auth.infrastructure.mapper.UsuarioMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Transactional
@Repository
@RequiredArgsConstructor
public class UsuarioRepositoryImpl implements UsuarioRepository {

    private final UsuarioJpaRepository usuarioJpaRepository;
    private final UsuarioMapper mapper;


    @Override
    public Usuario salvar (Usuario usuario) {
        UsuarioJpaEntity entidade = mapper.toEntity(usuario);
        UsuarioJpaEntity salvo = usuarioJpaRepository.save(entidade);
        return mapper.toDomain(salvo);
    }

    @Override
    public Optional<Usuario> buscarPorId(UUID id) {
        return usuarioJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioJpaRepository.findByEmail(email).map(mapper::toDomain);
    }
}
