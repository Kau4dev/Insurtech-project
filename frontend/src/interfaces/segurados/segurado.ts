

export type Segurado = {
    id?: string;
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
    createdAt?: string;
    updatedAt?: string;
}