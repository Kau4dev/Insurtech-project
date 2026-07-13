CREATE TABLE apolices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Segurado_id UUID NOT NULL REFERENCES segurados(id) ON DELETE CASCADE,
    numero_apolice VARCHAR(50) NOT NULL UNIQUE,
    tipo_seguro VARCHAR(30) NOT NULL,
    valor_seguro DECIMAL(14, 2) NOT NULL,
    valor_premio DECIMAL(14, 2) NOT NULL,
    data_inicio_vigencia DATE NOT NULL,
    data_fim_vigencia DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP
);