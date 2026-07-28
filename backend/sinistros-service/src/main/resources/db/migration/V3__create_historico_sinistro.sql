CREATE TABLE historico_sinistro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sinistro_id UUID NOT NULL,
    status_anterior VARCHAR(30),
    status_novo VARCHAR(30) NOT NULL,
    usuario_id UUID NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);