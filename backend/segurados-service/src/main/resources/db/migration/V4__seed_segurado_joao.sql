UPDATE segurados
SET usuario_id = 'c4b8e21a-1111-4444-8888-abcdef123456',
    email = 'joao@email.com',
    nome_razao_social = 'João Silva'
WHERE id = '83fba660-63fe-41bc-90df-97e8b955fbed' OR email = 'joao@email.com';

INSERT INTO segurados (id, tipo_pessoa, nome_razao_social, cpf_cnpj, email, telefone, data_nascimento, usuario_id)
SELECT '83fba660-63fe-41bc-90df-97e8b955fbed', 'PF', 'João Silva', '11111111111', 'joao@email.com', '11999998888', '1990-01-01', 'c4b8e21a-1111-4444-8888-abcdef123456'
WHERE NOT EXISTS (SELECT 1 FROM segurados WHERE usuario_id = 'c4b8e21a-1111-4444-8888-abcdef123456');

