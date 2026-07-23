CREATE TABLE eventos_pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sinistro UUID NOT NULL,
    valor_liquidado DECIMAL(14, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    data_processamento TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    evento_id_origem VARCHAR(100) NOT NULL UNIQUE ,
);