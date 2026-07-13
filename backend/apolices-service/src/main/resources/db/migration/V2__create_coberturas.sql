CREATE TABLE coberturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apolice_id UUID NOT NULL REFERENCES apolices(id) ON DELETE CASCADE,
    tipo_cobertura VARCHAR(50) NOT NULL,
    valor_cobertura DECIMAL(14, 2) NOT NULL,
    valor_franquia DECIMAL(14, 2) NOT NULL,
);