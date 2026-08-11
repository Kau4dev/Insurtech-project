
export type ApoliceRequest = {
    seguradoId: string;
    numeroApolice: string;
    tipoSeguro: 'AUTO' | 'RESIDENCIAL' | 'VIDA' | 'PATRIMONIAL' | 'EMPRESARIAL';
    valorSeguro: number;
    valorPremio: number;
    dataInicioVigencia: string;
    dataFimVigencia: string;
    coberturas: {
        tipoCobertura: string; // fazer validação dos tipos no componente, muito grande pra interface.
        valorCobertura: number;
        valorFranquia: number;
    }[];
}