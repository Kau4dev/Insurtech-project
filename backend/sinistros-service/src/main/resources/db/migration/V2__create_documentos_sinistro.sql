CREATE TABLE documentos_sinistro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sinistro_id UUID NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    url_arquivo VARCHAR(500) NOT NULL,
    data_upload TIMESTAMP NOT NULL DEFAULT now(),
);