
export type FiltrosApolices = {
    status?: 'ATIVA' | 'CANCELADA' | 'EXPIRADA' | 'SUSPENSA';
    tipoSeguro?: 'AUTO' | 'RESIDENCIAL' | 'VIDA' | 'PATRIMONIAL' | 'EMPRESARIAL';
    seguradoId?: string;
    page?: number;
    size?: number;
}