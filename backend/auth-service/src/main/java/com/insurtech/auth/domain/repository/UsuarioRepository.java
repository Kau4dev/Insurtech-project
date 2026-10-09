package com.insurtech.auth.domain.repository;

import com.insurtech.auth.domain.model.Usuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository {

    Usuario salvar(Usuario usuario);
    Optional<Usuario> buscarPorEmail(String email);
    Optional<Usuario> buscarPorId(UUID id);
    List<Usuario> listarTodos(Boolean ativo);

    default List<Usuario> listarTodos() {
        return listarTodos(null);
    }

}
