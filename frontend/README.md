<div align="center">

# InsurTech — Frontend

### Interface Corporativa B2B e Portal do Segurado B2C (P&C)

*Aplicação Single Page Application (SPA) moderna, acessível e orientada a papéis, construída com React 19, Tailwind CSS v4 e Vite 8.*

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?style=flat-square&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## Índice

- [Visão Geral](#visão-geral)
- [Contextos da Aplicação](#contextos-da-aplicação)
  - [Backoffice B2B](#1-backoffice-b2b-admin-gestor-analista)
  - [Portal do Segurado B2C](#2-portal-do-segurado-b2c-segurado)
- [Diferenciais Técnicos do Frontend](#diferenciais-técnicos-do-frontend)
  - [Padrões Nativos do React 19](#1-padrões-nativos-do-react-19)
  - [Compilação Nativa com Tailwind CSS v4](#2-compilação-nativa-com-tailwind-css-v4)
  - [Isolamento de Sessão por Aba e Trigger Reativo Cross-Tab](#3-isolamento-de-sessão-por-aba-e-trigger-reativo-cross-tab)
  - [Página 404 Institucional e Contextual](#4-página-404-institucional-e-contextual)
  - [Central de Notificações em Tempo Real e Sincronização Cross-Tab](#5-central-de-notificações-em-tempo-real-e-sincronização-cross-tab)
  - [Timeline Reativa de Microsserviços e Esteira Kafka](#6-timeline-reativa-de-microsserviços-e-esteira-kafka)
  - [Validação Robusta de Estado em Formulários com Acessibilidade Nativa](#7-validação-robusta-de-estado-em-formulários-com-acessibilidade-nativa)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Suíte de Testes Automatizados](#suíte-de-testes-automatizados)
- [Build e Containerização](#build-e-containerização)

---

## Visão Geral

O frontend da plataforma **InsurTech** é uma SPA resiliente que atua como interface primária tanto para os operadores internos da seguradora (Administradores, Gestores e Analistas) quanto para os clientes segurados. 

A aplicação consome exclusivamente os endpoints do ecossistema de microsserviços através do **API Gateway** (`http://localhost:8080`), delegando autenticação, roteamento, rate limiting distribuído e injeção de contexto de segurança (`X-Usuario-Id`, `X-Usuario-Papel` e `X-Correlation-Id`).

---

## Contextos da Aplicação

### 1. Backoffice B2B (`ADMIN`, `GESTOR`, `ANALISTA`)

Focado na alta densidade de informação e na eficiência operacional dos reguladores de sinistros:

* **Autenticação Segura**: Login corporativo (`/login`) com validação de JWT emitido pelo `auth-service`.
* **Dashboard Operacional**: Cards de métricas agregadas cacheadas no Redis, gráficos mensais, distribuição por status, fila de trabalho por analista e linha do tempo da esteira de microsserviços.
* **Gestão de Sinistros**:
  * Listagem avançada com paginação e filtros dinâmicos (status, número do sinistro, segurado, analista).
  * Registro de novos sinistros com validação de apólice ativa e segurado.
  * Regulação técnica: assunção de sinistro, aprovação, rejeição motivada e solicitação formal de pendências documentais.
  * Anexo restrito de documentos: botão de upload condicionado estritamente a sinistros no status `AGUARDANDO_DOCUMENTOS` com analista atribuído.
* **Gestão de Apólices e Segurados**:
  * Emissão, edição e cancelamento de apólices com detalhamento de coberturas.
  * Cadastro de segurados (PF e PJ) com orquestração transparente de usuário e exibição estritamente única das credenciais geradas via CSPRNG.

### 2. Portal do Segurado B2C (`SEGURADO`)

Experiência limpa e amigável para o cliente final:

* **Login Exclusivo do Portal**: Rota dedicada `/portal/login` com layout contextualizado.
* **Dashboard do Segurado**: Resumo de apólices vigentes, sinistros abertos e status de liquidação financeira.
* **Acompanhamento de Sinistros**: Timeline interativa com o histórico do processo e formulário seguro para envio de documentos complementares solicitados pela seguradora.
* **Minhas Apólices**: Consulta a apólices ativas e coberturas contratadas em modo leitura.

---

## Diferenciais Técnicos do Frontend

### 1. Padrões Nativos do React 19

* **Eliminação de `forwardRef`**: Todos os componentes base de formulário (`Input`, `Select`, `Textarea`) recebem `ref` diretamente como prop sem necessidade do wrapper `React.forwardRef`.
* **Sintaxe Nativa do Context API**: O `AuthContext` utiliza a sintaxe moderna `<AuthContext value={...}>`, removendo a necessidade do wrapper `.Provider`.
* **Performance Otimizada**: Integração com as convenções e compiladores mais recentes do ecossistema React.

### 2. Compilação Nativa com Tailwind CSS v4

* Adoção do `@tailwindcss/vite` como plugin nativo do Vite, eliminando configurações legadas de PostCSS, Autoprefixer e `tailwind.config.js`.
* Tokens de tema, cores corporativas (`slate`, `indigo`, `emerald`, `amber`, `rose`) e estilos declarados diretamente no CSS (`src/index.css`) com carregamento instantâneo.

### 3. Isolamento de Sessão por Aba e Trigger Reativo Cross-Tab

Um dos principais desafios em aplicações híbridas B2B/B2C é o conflito de credenciais quando o mesmo operador utiliza o Backoffice em uma aba e o Portal do Segurado em outra aba simultânea.

* **Armazenamento com Prioridade em `sessionStorage`**:
  O módulo `src/utils/tokenStorage.ts` separa os tokens e papéis por contexto e prioriza o `sessionStorage`:
  * Backoffice: `insurtech_token_internal` e `insurtech_role_internal`.
  * Portal: `insurtech_token_portal` e `insurtech_role_portal`.
  * Fallback transparente para `localStorage` para persistência entre recarregamentos.
* **Triggers Reativos de Sincronização (`storage` e `focus`)**:
  * Listener `focus`: Ao focar uma aba em segundo plano, revalida instantaneamente a integridade do papel e do token ativos.
  * Listener `storage`: Detecta logouts em abas irmãs e atualiza o estado da aplicação.
* **Invalidação Proativa de Cache**:
  Ao identificar conflito de perfis ou receber status `403 Forbidden` do backend, a aplicação invoca `queryClient.clear()`, limpa os tokens da aba (`limparTokens()`) e redireciona de imediato para a tela de login adequada (`/login` ou `/portal/login`), prevenindo telas em branco, estados inconsistentes e vazamento de cache entre perfis.

### 4. Página 404 Institucional e Contextual

Componente institucional `NotFoundPage` (`src/pages/NotFoundPage.tsx`) com cobertura completa de testes:
* Captura qualquer rota inválida na raiz (`*`) ou sob rotas aninhadas do Portal (`/portal/*`).
* Botão contextual com atalho seguro: redireciona para o Dashboard do Portal (`/portal/dashboard`) se acessado no escopo do segurado, ou para o Dashboard Operacional (`/`) se acessado no escopo do backoffice.
* Conformidade rigorosa com diretrizes de acessibilidade (ARIA labels, semântica e contrastes).

### 5. Central de Notificações em Tempo Real e Sincronização Cross-Tab

* **Hook Centralizado (`src/hooks/useNotificacoes.ts`)**: Encapsula todo o ciclo de vida, contagem e mutações de notificações na interface.
* **Background Polling Contínuo (3 segundos)**: Configurado com `refetchIntervalInBackground: true` e `staleTime: 0`. Garante que abas inativas ou janelas em segundo plano continuem atualizando sem interrupção e revalidem de imediato ao receber foco.
* **Sincronização Instantânea Cross-Tab (`BroadcastChannel`)**: Utiliza o canal nativo `insurtech_notificacoes_channel`. Quando uma aba realiza qualquer mutação (criação de sinistro, aprovação, rejeição, solicitação ou envio de documento, ou marcação de leitura), todas as abas e janelas abertas simultaneamente recebem o sinal e invalidam suas consultas (`queryClient.invalidateQueries({ queryKey: ["notificacoes"] })`) em milissegundos.
* **Isolamento de Leitura por Perfil (`lida_segurado` vs `lida_interno`)**: A leitura efetuada pelo segurado no Portal B2C não remove o status não lido para os analistas no Backoffice B2B e vice-versa.
* **Categorização Visual e Timestamps Relativos**:
  * `SINISTRO_REGISTRADO` (Azul / Info)
  * `DOCUMENTO_SOLICITADO` (Amarelo / Aviso)
  * `DOCUMENTO_RECEBIDO` (Azul / Info)
  * `SINISTRO_REJEITADO` (Vermelho / Alerta)
  * `PAGAMENTO_LIQUIDADO` (Verde / Sucesso)
* **Navegação Direta**: O clique na notificação marca como lida e redireciona instantaneamente para o recurso correspondente (`/sinistros` ou `/portal`).

### 6. Timeline Reativa de Microsserviços e Esteira Kafka

* Componente `MicroserviceTimelineCard` no Dashboard exibe a esteira completa de microsserviços.
* Demonstração visual do ciclo de vida: `sinistros-service` ➔ Kafka (Outbox) ➔ `liquidacao-service` (Inbox) ➔ `notificacao-service`.
* Rastreamento visual de status com badges e ícones responsivos imunes a quebras (`whitespace-nowrap shrink-0`).

### 7. Validação Robusta de Estado em Formulários com Acessibilidade Nativa

* **Controle de Estado `is-touched`**: Todos os componentes base de formulário (`Input`, `Select`, `Textarea`) gerenciam o ciclo de vida de foco e toque, exibindo feedback visual de erro ou sucesso somente após o usuário interagir com o campo ou tentar submeter.
* **Acessibilidade Nativa (WCAG 2.1 AA)**: Integração com `aria-invalid`, `aria-describedby` e pseudoclasses CSS modernas como `:user-invalid`, associando mensagens de erro textuais diretamente ao controle para leitores de tela.
* **Prevenção Ativa de Envios Inválidos**: Formulários complexos — como o assistente de etapas de sinistro (`AbrirSinistroWizard`) e o envio de documentos — utilizam o componente `FormErrorBanner` e validação prévia com scroll/foco no primeiro campo pendente.

---

## Estrutura de Pastas

A arquitetura adota o padrão **Feature-Sliced Architecture**, promovendo modularidade e alta coesão:

```
frontend/src/
├── api/                             # Clientes HTTP Axios tipados por domínio
│   ├── axiosClient.ts               # Instância centralizada com interceptors (401/403, JWT, VITE_API_URL)
│   ├── authApi.ts                   # Login, consulta e criação de usuários
│   ├── sinistrosApi.ts              # CRUD de sinistros, transições de status e documentos
│   ├── apolicesApi.ts               # Gestão de apólices e coberturas
│   ├── seguradosApi.ts              # Gestão de segurados PF/PJ
│   └── notificacoesApi.ts           # Listagem e leitura de notificações
│
├── components/                      # Componentes reutilizáveis e primitivos de UI
│   ├── common/                      # Modais, botões, tabelas, badges e inputs
│   └── layout/                      # AppLayout, Header, HeaderSearch, NotificationsPopover
│
├── context/                         # Estados globais
│   └── AuthContext.tsx              # Autenticação, listeners reativos e purga de cache
│
├── hooks/                           # Custom hooks de escopo global
│   └── useNotificacoes.ts           # Central de notificações (polling 3s, BroadcastChannel, isolamento)
│
├── features/                        # Módulos verticais de negócio
│   ├── apolices/                    # Components, hooks, schemas e types de apólices
│   ├── dashboard/                   # KPIs, gráficos (MonthlyBarChart, StatusBreakdown) e Timeline
│   ├── portal-segurado/             # Layout e páginas exclusivas do Segurado B2C
│   ├── segurados/                   # Formulários de segurados e modal de credenciais
│   └── sinistros/                   # Timeline de sinistros, modais de análise e anexo condicional
│
├── interfaces/                      # Mappers e interfaces de transporte
├── pages/                           # Páginas roteadas (Dashboard, Sinistros, Apólices, Segurados, NotFoundPage)
├── routes/                          # Roteamento centralizado
│   ├── AppRouter.tsx                # Definição declarativa de rotas
│   └── RotaProtegida.tsx            # Guard de rotas com RBAC e verificação contínua de papel
│
├── utils/                           # Formatadores, validadores e utilitários
│   ├── tokenStorage.ts              # Isolamento de tokens e papéis por aba
│   ├── formatters.ts                # Máscaras de CPF, CNPJ, Moeda (BRL) e datas
│   └── errorUtils.ts                # Tratamento amigável de erros da API
│
└── test/                            # Setup de testes e mocks do Vitest
    └── setup.ts                     # Configurações do ambiente jsdom
```

---

## Variáveis de Ambiente

O frontend é parametrizado via variáveis de ambiente compatíveis com o Vite (`VITE_*`).

| Variável | Descrição | Padrão Local |
|---|---|---|
| `VITE_API_URL` | URL base do API Gateway | `http://localhost:8080` |

### Configuração Inicial

```bash
# Copie o arquivo de exemplo para criar a sua configuração local
cp .env.example .env
```

O arquivo `.env` está incluído no `.gitignore` e nunca deve ser versionado no Git.

---

## Scripts Disponíveis

No diretório `frontend/`, você pode executar:

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR) na porta `5173` |
| `npm test` | Executa a suíte completa de testes automatizados com Vitest |
| `npm run test:watch` | Executa os testes em modo interativo de observação (watch) |
| `npm run build` | Valida tipagem com TypeScript (`tsc -b`) e compila para produção em `dist/` |
| `npm run lint` | Executa o linter ESLint para validar boas práticas e padrões de código |
| `npm run preview` | Pré-visualiza localmente a build de produção compilada |

---

## Suíte de Testes Automatizados

A cobertura de testes do frontend utiliza **Vitest 5** e **React Testing Library** com ambiente simulado via `jsdom`:

```bash
# Executa todos os testes
npm test
```

### Estatísticas da Suíte

* **34 arquivos de teste** cobrindo APIs, componentes visuais, custom hooks, schemas de validação, páginas e utilitários.
* **186 testes automatizados**, todos aprovados com 100% de sucesso e zero falhas.
* Testes com cobertura de central de notificações reativas com BroadcastChannel e background polling (`useNotificacoes.test.tsx`), isolamento de sessão por aba (`tokenStorage.test.ts`), proteção de rotas com RBAC (`RotaProtegida.test.tsx`), página 404 (`NotFoundPage.test.tsx`), componentes de formulário com validação de estado e timeline de sinistros.

---

## Build e Containerização

O frontend possui um `Dockerfile` otimizado em múltiplos estágios (**Multi-stage Build**):

1. **Estágio de Build (`node:22-alpine`)**:
   * Instalação limpa de dependências (`npm ci`).
   * Compilação da aplicação com Vite e minificação dos bundles em `dist/`.
2. **Estágio de Produção (`nginx:alpine`)**:
   * Cópia dos artefatos compilados para `/usr/share/nginx/html`.
   * Configuração de servidor web via `nginx.conf` com fallback para SPA (`try_files $uri $uri/ /index.html`).
   * Exposição na porta `80` (mapeada para `5173` via Docker Compose).

```bash
# Execução direta via Docker Compose na raiz do projeto
docker compose up --build frontend
```

---

<div align="center">
<sub>InsurTech Platform · Frontend SPA · React 19 · Vite 8 · Tailwind CSS v4</sub>
</div>
