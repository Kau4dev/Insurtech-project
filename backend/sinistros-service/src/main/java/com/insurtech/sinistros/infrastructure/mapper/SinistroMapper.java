package com.insurtech.sinistros.infrastructure.mapper;

import com.insurtech.sinistros.application.dto.request.SinistroRequestDTO;
import com.insurtech.sinistros.application.dto.response.DocumentoSinistroResponseDTO;
import com.insurtech.sinistros.application.dto.response.HistoricoSinistroResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroDetalhadoResponseDTO;
import com.insurtech.sinistros.application.dto.response.SinistroResponseDTO;
import com.insurtech.sinistros.domain.model.DocumentoSinistro;
import com.insurtech.sinistros.domain.model.HistoricoSinistro;
import com.insurtech.sinistros.domain.model.Sinistro;
import com.insurtech.sinistros.infrastructure.persistence.SinistroJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface SinistroMapper {

    SinistroJpaEntity toEntity(Sinistro domain);

    Sinistro toDomain(SinistroJpaEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "analistaId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "motivoRejeicao", ignore = true)
    @Mapping(target = "valorAprovado", ignore = true)
    @Mapping(target = "dataRegistro", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "historico", ignore = true)
    @Mapping(target = "documentos", ignore = true)
    Sinistro toDomain(SinistroRequestDTO request);

    SinistroResponseDTO toResponse(Sinistro domain);

    @Mapping(target = "historicos", source = "historico")
    SinistroDetalhadoResponseDTO toDetalhadoResponse(Sinistro domain);

    DocumentoSinistroResponseDTO toResponse(DocumentoSinistro documento);

    HistoricoSinistroResponseDTO toResponse(HistoricoSinistro historico);
}
