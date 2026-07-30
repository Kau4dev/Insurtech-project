CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO usuarios (id, nome, email, senha_hash, papel, ativo) VALUES
    (gen_random_uuid(), 'Admin', 'admin@insurtech.com',
    '$2a$12$lfHl6aOJtGfJf.6quhSILeN58.4AdACwTGhgOlY6qM0UjEWw9Exu6', -- senha: password
    'ADMIN', true),
    (gen_random_uuid(), 'Analista', 'analista@insurtech.com',
    '$2a$12$lfHl6aOJtGfJf.6quhSILeN58.4AdACwTGhgOlY6qM0UjEWw9Exu6.',
    'ANALISTA', true),
    (gen_random_uuid(), 'Gestor', 'gestor@insurtech.com',
    '$2a$12$lfHl6aOJtGfJf.6quhSILeN58.4AdACwTGhgOlY6qM0UjEWw9Exu6.',
    'GESTOR', true);