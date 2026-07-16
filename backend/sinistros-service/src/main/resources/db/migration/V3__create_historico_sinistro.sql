CREATE TABLE historico_sinistro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sinistro_id UUID NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20) NOT NULL,
    usuario_id UUID NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);