export type SeguradoRequest = {
    tipoPessoa: 'PF' | 'PJ';
    nomeRazaoSocial: string;
    cpfCnpj: string;
    email: string;
    telefone?: string;
    dataNascimento?: string;
    enderecoLogradouro?: string;
    enderecoCidade?: string;
    enderecoUf?: string;
    enderecoCep?: string;
}

export type SeguradoUpdateRequest = Partial<Omit<SeguradoRequest, 'tipoPessoa' | 'cpfCnpj'>>;