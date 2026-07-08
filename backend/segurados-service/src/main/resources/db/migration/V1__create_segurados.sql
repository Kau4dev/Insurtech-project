CREATE TABLE segurados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_pessoa VARCHAR(2) NOT NULL,
    nome_razao_social VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco_logradouro VARCHAR(255),
    endereco_cidade VARCHAR(100),
    endereco_uf VARCHAR(2),
    endereco_cep VARCHAR(9),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP
);