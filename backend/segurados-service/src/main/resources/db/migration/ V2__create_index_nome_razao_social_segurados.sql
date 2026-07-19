-- Ativa a extensão de trigramas (só precisa rodar uma vez no banco)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_segurado_nome_razao_social_tgrm
    ON segurado USING gin (LOWER(nome_razao_social) gin_trgm_ops);
