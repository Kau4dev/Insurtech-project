CREATE TABLE sinistros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_sinistro VARCHAR(50) NOT NULL UNIQUE,
    apolice_id UUID NOT NULL,
    segurado_id UUID NOT NULL,
    analista_id UUID NOT NULL,
    tipo_sinistro VARCHAR(30) NOT NULL,
    descricao TEXT NOT NULL,
    data_ocorrencia DATE NOT NULL,
    data_registro TIMESTAMP NOT NULL DEFAULT now(),
    valor_estimado DECIMAL(14, 2) NOT NULL,
    valor_aprovado DECIMAL(14, 2) NULLABLE,
    status VARCHAR(20) NOT NULL,
    motivo_rejeicao TEXT NULLABLE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP

)