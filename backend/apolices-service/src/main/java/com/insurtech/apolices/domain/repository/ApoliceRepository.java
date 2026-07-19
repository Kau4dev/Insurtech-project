package com.insurtech.apolices.domain.repository;

import com.insurtech.apolices.domain.model.Apolice;
import com.insurtech.apolices.domain.model.Status;
import com.insurtech.apolices.domain.model.TipoSeguro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ApoliceRepository {
    Apolice salvar(Apolice apolice);
    Optional<Apolice> buscarPorId(UUID id);
    Optional<Apolice> buscarPorNumero(String numeroApolice);
    Page<Apolice> listar(UUID seguradoId, Status status, TipoSeguro tipoSeguro, Pageable pageable);

}
