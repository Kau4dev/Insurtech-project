ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS lida_segurado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS lida_interno BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE notificacoes SET lida_segurado = lida, lida_interno = lida;

CREATE INDEX IF NOT EXISTS idx_notificacoes_lida_segurado ON notificacoes(segurado_id, lida_segurado);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida_interno ON notificacoes(lida_interno);
