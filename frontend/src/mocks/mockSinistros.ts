import type { SinistroDetalhado } from "../interfaces/sinistros/sinistro";

export const MOCK_SINISTROS: SinistroDetalhado[] = [
  {
    id: "sinistro-uuid-001",
    numeroSinistro: "SIN-2026-0001",
    apoliceId: "apolice-uuid-001",
    seguradoId: "123e4567-e89b-12d3-a456-426614174001",
    analistaId: "analista-uuid-001",
    tipoSinistro: "COLISAO",
    descricao:
      "Colisão traseira em semáforo na Av. Paulista envolvendo dois veículos. Danos expressivos no para-choque e tampa traseira.",
    dataOcorrencia: "2026-02-10",
    valorEstimado: 8500.0,
    valorAprovado: 8200.0,
    status: "APROVADO",
    createdAt: "2026-02-10T14:30:00Z",
    updatedAt: "2026-02-13T14:30:00Z",
    documentos: [
      {
        id: "doc-001",
        tipoDocumento: "BOLETIM_OCORRENCIA",
        nomeArquivo: "boletim_ocorrencia_sin_0001.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/bo_0001.pdf",
        dataUpload: "2026-02-10T15:00:00Z",
      },
      {
        id: "doc-002",
        tipoDocumento: "FOTO_DANO",
        nomeArquivo: "foto_traseira_danificada.jpg",
        urlArquivo: "https://storage.insurtech.com/docs/foto_0001.jpg",
        dataUpload: "2026-02-10T15:10:00Z",
      },
      {
        id: "doc-003",
        tipoDocumento: "LAUDO_TECNICO",
        nomeArquivo: "laudo_pericial_oficina.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/laudo_0001.pdf",
        dataUpload: "2026-02-12T11:00:00Z",
      },
    ],
    historicos: [
      {
        statusAnterior: "REGISTRADO",
        statusNovo: "EM_ANALISE",
        observacao:
          "Sinistro distribuído para regulação com analista responsável.",
        createdAt: "2026-02-11T09:00:00Z",
      },
      {
        statusAnterior: "EM_ANALISE",
        statusNovo: "APROVADO",
        observacao:
          "Laudo pericial e orçamentos aprovados pela equipe técnica.",
        createdAt: "2026-02-13T14:30:00Z",
      },
    ],
  },
  {
    id: "sinistro-uuid-002",
    numeroSinistro: "SIN-2026-0002",
    apoliceId: "apolice-uuid-002",
    seguradoId: "123e4567-e89b-12d3-a456-426614174002",
    analistaId: "analista-uuid-002",
    tipoSinistro: "INCENDIO",
    descricao:
      "Princípio de incêndio provocado por curto-circuito na sala de baterias e servidores da empresa.",
    dataOcorrencia: "2026-02-25",
    valorEstimado: 45000.0,
    status: "EM_ANALISE",
    createdAt: "2026-02-25T11:20:00Z",
    updatedAt: "2026-02-26T10:00:00Z",
    documentos: [
      {
        id: "doc-004",
        tipoDocumento: "BOLETIM_OCORRENCIA",
        nomeArquivo: "boletim_bombeiros_incendio.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/bo_incendio_0002.pdf",
        dataUpload: "2026-02-25T16:00:00Z",
      },
      {
        id: "doc-005",
        tipoDocumento: "NOTA_FISCAL",
        nomeArquivo: "nf_equipamentos_danificados.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/nf_0002.pdf",
        dataUpload: "2026-02-26T09:00:00Z",
      },
    ],
    historicos: [
      {
        statusAnterior: "REGISTRADO",
        statusNovo: "EM_ANALISE",
        observacao:
          "Vistoria presencial de perito agendada para avaliar extensão das perdas elétricas.",
        createdAt: "2026-02-26T10:00:00Z",
      },
    ],
  },
  {
    id: "sinistro-uuid-003",
    numeroSinistro: "SIN-2026-0003",
    apoliceId: "apolice-uuid-003",
    seguradoId: "123e4567-e89b-12d3-a456-426614174003",
    analistaId: "analista-uuid-001",
    tipoSinistro: "ALAGAMENTO",
    descricao:
      "Infiltração decorrente de fortes chuvas de verão causou alagamento no piso inferior da residência com perda de mobília.",
    dataOcorrencia: "2026-03-01",
    valorEstimado: 12500.0,
    status: "AGUARDANDO_DOCUMENTOS",
    createdAt: "2026-03-01T17:45:00Z",
    updatedAt: "2026-03-03T16:00:00Z",
    documentos: [
      {
        id: "doc-006",
        tipoDocumento: "FOTO_DANO",
        nomeArquivo: "fotos_comodos_alagados.zip",
        urlArquivo: "https://storage.insurtech.com/docs/fotos_alagamento.zip",
        dataUpload: "2026-03-01T18:00:00Z",
      },
    ],
    historicos: [
      {
        statusAnterior: "REGISTRADO",
        statusNovo: "EM_ANALISE",
        observacao:
          "Analista iniciou triagem das fotos e cobertura residencial.",
        createdAt: "2026-03-02T11:00:00Z",
      },
      {
        statusAnterior: "EM_ANALISE",
        statusNovo: "AGUARDANDO_DOCUMENTOS",
        observacao:
          "Solicitados 3 orçamentos idôneos de reforma e reposição de piso ao segurado.",
        createdAt: "2026-03-03T16:00:00Z",
      },
    ],
  },
  {
    id: "sinistro-uuid-004",
    numeroSinistro: "SIN-2026-0004",
    apoliceId: "apolice-uuid-001",
    seguradoId: "123e4567-e89b-12d3-a456-426614174001",
    analistaId: "analista-uuid-003",
    tipoSinistro: "QUEBRA_DE_VIDRO",
    descricao:
      "Projétil de pedra em pista de alta velocidade provocou trinca irreversível no para-brisa frontal.",
    dataOcorrencia: "2026-03-05",
    valorEstimado: 1400.0,
    valorAprovado: 1400.0,
    status: "PAGO",
    createdAt: "2026-03-05T13:00:00Z",
    updatedAt: "2026-03-06T09:00:00Z",
    documentos: [
      {
        id: "doc-007",
        tipoDocumento: "FOTO_DANO",
        nomeArquivo: "foto_trinca_parabrisa.jpg",
        urlArquivo: "https://storage.insurtech.com/docs/vidro_0004.jpg",
        dataUpload: "2026-03-05T13:30:00Z",
      },
      {
        id: "doc-008",
        tipoDocumento: "NOTA_FISCAL",
        nomeArquivo: "nf_autovidros_substituicao.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/nf_vidro_0004.pdf",
        dataUpload: "2026-03-05T14:30:00Z",
      },
    ],
    historicos: [
      {
        statusAnterior: "REGISTRADO",
        statusNovo: "EM_ANALISE",
        observacao: "Processo em atendimento rápido via cobertura de vidros.",
        createdAt: "2026-03-05T14:00:00Z",
      },
      {
        statusAnterior: "EM_ANALISE",
        statusNovo: "APROVADO",
        observacao: "Autorizada a troca imediata em rede credenciada.",
        createdAt: "2026-03-05T15:00:00Z",
      },
      {
        statusAnterior: "APROVADO",
        statusNovo: "PAGO",
        observacao: "Pagamento liquidado com sucesso pela operadora.",
        createdAt: "2026-03-06T09:00:00Z",
      },
    ],
  },
  {
    id: "sinistro-uuid-005",
    numeroSinistro: "SIN-2026-0005",
    apoliceId: "apolice-uuid-004",
    seguradoId: "123e4567-e89b-12d3-a456-426614174004",
    analistaId: "analista-uuid-002",
    tipoSinistro: "DANO_A_TERCEIRO",
    descricao:
      "Queda de andaime provocou avarias na fachada e veículo de vizinho durante obras de reforma predial.",
    dataOcorrencia: "2026-01-20",
    valorEstimado: 18000.0,
    status: "REJEITADO",
    motivoRejeicao: "Ocorrência fora da vigência da apólice",
    createdAt: "2026-01-21T10:15:00Z",
    updatedAt: "2026-01-23T11:00:00Z",
    documentos: [
      {
        id: "doc-009",
        tipoDocumento: "BOLETIM_OCORRENCIA",
        nomeArquivo: "boletim_ocorrencia_terceiros.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/bo_0005.pdf",
        dataUpload: "2026-01-21T11:00:00Z",
      },
    ],
    historicos: [
      {
        statusAnterior: "REGISTRADO",
        statusNovo: "EM_ANALISE",
        observacao: "Verificação de vigência e cláusulas contratuais.",
        createdAt: "2026-01-22T09:30:00Z",
      },
      {
        statusAnterior: "EM_ANALISE",
        statusNovo: "REJEITADO",
        observacao:
          "A apólice informada expirou antes da data declarada do sinistro.",
        createdAt: "2026-01-23T11:00:00Z",
      },
    ],
  },
  {
    id: "sinistro-uuid-006",
    numeroSinistro: "SIN-2026-0006",
    apoliceId: "apolice-uuid-005",
    seguradoId: "123e4567-e89b-12d3-a456-426614174005",
    tipoSinistro: "ROUBO_FURTO",
    descricao:
      "Veículo subtraído mediante furto em via pública com arrombamento de maçaneta durante horário noturno.",
    dataOcorrencia: "2026-03-08",
    valorEstimado: 75000.0,
    status: "REGISTRADO",
    createdAt: "2026-03-08T20:30:00Z",
    updatedAt: "2026-03-08T20:30:00Z",
    documentos: [
      {
        id: "doc-010",
        tipoDocumento: "BOLETIM_OCORRENCIA",
        nomeArquivo: "boletim_roubo_veiculo.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/bo_0006.pdf",
        dataUpload: "2026-03-08T21:00:00Z",
      },
      {
        id: "doc-011",
        tipoDocumento: "CNH",
        nomeArquivo: "cnh_segurado_roberto.pdf",
        urlArquivo: "https://storage.insurtech.com/docs/cnh_0006.pdf",
        dataUpload: "2026-03-08T21:05:00Z",
      },
    ],
    historicos: [
      {
        statusAnterior: "REGISTRADO",
        statusNovo: "REGISTRADO",
        observacao:
          "Sinistro registrado no sistema pelo segurado via portal online.",
        createdAt: "2026-03-08T20:30:00Z",
      },
    ],
  },
];
