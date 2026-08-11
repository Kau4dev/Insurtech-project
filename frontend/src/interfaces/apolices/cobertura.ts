
export type Cobertura = {
    id?: string;
    tipoCobertura: string; // fazer validação dos tipos no componente, muito grande pra interface.
    valorCobertura: number;
    valorFranquia: number;
}