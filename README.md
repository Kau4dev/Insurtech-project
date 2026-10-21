<div align="center">

# InsurTech

### Plataforma Corporativa de Gestão de Sinistros e Apólices (P&C)

*Sistema B2B/B2C para o ciclo de vida completo de sinistros — desde o registro até a liquidação — construído com arquitetura de microsserviços event-driven.*

<br/>

**Português** | [English](./README.en.md)

<br/>

![Java](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.16-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2025.0.3-6DB33F?style=flat-square&logo=spring&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-3.7-231F20?style=flat-square&logo=apachekafka&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-v2-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/Licença-Educacional-9B59B6?style=flat-square)

</div>

> [!NOTE]
> **Destaques da Plataforma em 5 Linhas (TL;DR):**
> 1. **Ecossistema Enterprise Event-Driven**: 7 microsserviços desacoplados em Java 21 / Spring Boot 3.5 com Clean Architecture, DDD e SPA moderna em React 19 + Tailwind CSS v4.
> 2. **Consistência Transacional Sem Falhas**: Padrões *Transactional Outbox* e *Transactional Inbox* com Apache Kafka (KRaft), garantindo entrega *Effectively-Once* sem perda ou duplicidade de eventos financeiros de liquidação.
> 3. **Segurança Avançada e Isolamento**: RBAC hierárquico corporativo, proteção Anti-IDOR centralizada, senhas seguras geradas via CSPRNG de alta entropia e isolamento de sessão por aba com prioridade em `sessionStorage`.
> 4. **Observabilidade e Resiliência Nativas**: Rastreabilidade distribuída ponta a ponta com Correlation ID em todas as camadas sem containers adicionais de APM, com resiliência via Resilience4j e rate limiting distribuído no Redis.
> 5. **Qualidade Comprovada em Testes**: 520 testes automatizados (334 backend com Testcontainers + 186 frontend com Vitest) executando com 100% de sucesso e zero falhas em CI/CD.

---

## Demonstração Visual da Plataforma

<div align="center">
  <img src="./docs/assets/fluxo-sinistro.gif" alt="Fluxo Operacional de Sinistros e Liquidação Event-Driven" width="95%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
  <p><em>Demonstração do ciclo completo: Abertura do Sinistro ➔ Análise e Aprovação ➔ Liquidação via Kafka (Inbox/Outbox) ➔ Notificação em Tempo Real</em></p>
</div>

<br/>

| **Backoffice B2B (Dashboard Operacional)** | **Portal do Segurado B2C (Área do Cliente)** |
|:---:|:---:|
| [![Dashboard B2B](./docs/assets/dashboard-b2b.png)](./docs/assets/dashboard-b2b.png) | [![Portal do Segurado](./docs/assets/portal-segurado.png)](./docs/assets/portal-segurado.png) |
| *Métricas em tempo real, fila pericial e esteira de eventos* | *Consulta de apólices ativas, acionamento e acompanhamento* |

| **Regulação Técnica e Anexos (Drawer)** | **Apache Kafka UI (Tópicos & Eventos Reais)** |
|:---:|:---:|
| [![Análise do Sinistro](./docs/assets/analise-sinistro-drawer.png)](./docs/assets/analise-sinistro-drawer.png) | [![Kafka UI Tópicos](./docs/assets/kafka-ui-topics.png)](./docs/assets/kafka-ui-topics.png) |
| *Linha do tempo pericial, conferência documental e aprovação* | *Tópicos de negócio, filas de retry não-bloqueantes e DLT* |

---

## Índice

- [Demonstração Visual da Plataforma](#demonstração-visual-da-plataforma)
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Microsserviços](#microsserviços)
- [Fluxo de Negócio](#fluxo-de-negócio)
- [Frontend](#frontend)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Testes](#testes)
- [Acessos e Credenciais](#acessos-e-credenciais)
- [Endpoints da API](#endpoints-da-api)
- [Diferenciais Técnicos](#diferenciais-técnicos)
  - [Transactional Outbox Pattern](#1-transactional-outbox-pattern-sinistros-service)
  - [Transactional Inbox Pattern & Idempotência Estrita](#2-transactional-inbox-pattern-liquidacao-service--idempotência-estrita)
  - [Observabilidade Leve Distribuída](#3-observabilidade-leve-distribuída-sem-containers-adicionais-de-apm)
  - [Ciclo Bidirecional de Solicitação e Notificação de Documentos](#4-ciclo-bidirecional-de-solicitação-e-notificação-de-documentos)
  - [Provisionamento B2B de Usuários e Geração de Senhas de Alta Entropia](#5-provisionamento-b2b-de-usuários-e-geração-de-senhas-de-alta-entropia)
  - [Centralized Security Validator Pattern & Anti-IDOR](#6-centralized-security-validator-pattern--anti-idor)
  - [Serialização Segura de Cache com Polymorphic Type Validator](#7-serialização-segura-de-cache-com-polymorphic-type-validator)
  - [Arquitetura de Filtros HTTP com OncePerRequestFilter & OpenAPI Desacoplado](#8-arquitetura-de-filtros-http-com-onceperrequestfilter--openapi-desacoplado)
  - [Frontend Moderno — React 19 & Tailwind CSS v4 Nativo](#9-frontend-moderno--react-19--tailwind-css-v4-nativo)
  - [Padronização Global de Testes com @DisplayName e Testcontainers](#10-padronização-global-de-testes-com-displayname-e-testcontainers)
  - [Gerenciamento Unificado de Ambientes com .env e Docker Compose](#11-gerenciamento-unificado-de-ambientes-com-env-e-docker-compose)
  - [Isolamento de Sessão por Aba e Trigger Reativo Cross-Tab](#12-isolamento-de-sessão-por-aba-e-trigger-reativo-cross-tab)
  - [Isolamento de Leitura de Notificações por Perfil e Sincronização em Tempo Real](#13-isolamento-de-leitura-de-notificações-por-perfil-e-sincronização-em-tempo-real)
  - [Validação Robusta de Estado em Formulários com Acessibilidade Nativa](#14-validação-robusta-de-estado-em-formulários-com-acessibilidade-nativa)
- [Licença](#licença)

---

## Visão Geral

| Dimensão | Descrição |
|---|---|
| **Domínio** | Seguros de Propriedade & Acidentes (P&C — Property & Casualty) |
| **Tipo** | Plataforma híbrida — backoffice B2B para analistas/gestores + Portal B2C para segurados |
| **Arquitetura** | Microsserviços independentes com banco de dados isolado por serviço (Database-per-Service: 6 databases) |
| **Comunicação** | Híbrida: REST síncrono via OpenFeign + eventos assíncronos via Apache Kafka (KRaft) |
| **Confiabilidade** | **Transactional Outbox** (`sinistros-service`) + **Transactional Inbox** (`liquidacao-service`): garantia de ponta a ponta *At-Least-Once* ➔ *Effectively-Once* |
| **Padrão Interno** | Clean Architecture + Domain-Driven Design (DDD) em cada serviço |

### Atores do Sistema

| Papel | Permissões |
|---|---|
| **Admin** | Gerencia usuários, atribui papéis, acesso irrestrito à plataforma |
| **Gestor** | Acesso ao dashboard consolidado com métricas, supervisão geral do processo |
| **Analista** | Registra sinistros, realiza análise técnica, aprova ou rejeita, solicita documentação adicional |
| **Segurado** | Acessa o Portal do Segurado (B2C) — visualiza suas apólices e sinistros exclusivos, anexa documentos solicitados |

---

## Arquitetura

O sistema segue o padrão **API Gateway** como único ponto de entrada para todas as aplicações clientes (Backoffice B2B e Portal do Segurado B2C). A comunicação cross-service adota um modelo híbrido e desacoplado: REST síncrono via **OpenFeign com Resilience4j** (circuit breaker e retry) para validações de consistência imediata e **Apache Kafka 3.7 (KRaft)** com **Transactional Outbox Pattern** e **Transactional Inbox Pattern** para propagação e consumo confiável de eventos de negócio assíncronos sem duplicidade.

```
                        ┌────────────────────────────────────────────────────────┐
   React Frontend       │                 gateway-service  :8080                 │
   (SPA via Nginx) ───► │  JWT Auth · CORS · Routing · Rate Limit · Correlation  │
                        └───────────────────────────┬────────────────────────────┘
                                                    │ Redis (Rate Limit)
         ┌──────────────────┬───────────────────────┼───────────────────────┬────────────────────────┐
         │                  │                       │                       │                        │
         ▼                  ▼                       ▼                       ▼                        ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐ ┌─────────────────────────┐ ┌─────────────────────┐
│   auth-service   ││ segurados-service││ apolices-service │ │    sinistros-service    │ │  notificacao-service│
│      :8084       ││      :8085       ││      :8086       │ │          :8087          │ │        :8089        │
│    [auth_db]     ││  [segurados_db]  ││   [apolices_db]  │ │[sinistros_db|outbox_ev] │ │  [notificacao_db]   │
└────────▲─────────┘└───────▲──▲───────┘└─────────▲────────┘ └──────────┬────────┬───────┘ └──────────▲──────────┘
         │ Feign            │  │                  │                     │        │                    │
         └──────────────────┘  └────── Feign ─────┴─────────────────────┘        │ Kafka (notificações│
                                                                                 │ de docs, status)   │
                                                   Kafka: sinistro.aprovado      │                    │
                                                   (Header: X-Event-Id imutável) │                    │
                                                                                 ▼                    │
                                                                     ┌──────────────────────┐         │
                                                                     │   liquidacao-service  │         │
                                                                     │       :8088          │         │
                                                                     │[liquidacao_db|inbox] │         │
                                                                     └──────────┬───────────┘         │
                                                                                │                     │
                                                                    Kafka: pagamento.liquidado        │
                                                                                │                     │
                                                        ┌───────────────────────┴─────────────────────┘
                                                        ▼
                                                 sinistros-service
                                                 (consumer: status → PAGO)

   Infraestrutura compartilhada:
   ┌────────────────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
   │  PostgreSQL 16                 │   │  Apache Kafka 3.7    │   │     Redis 7         │
   │  (6 databases isolados)        │   │  (KRaft, sem ZooK.) │   │  cache + rate limit │
   │  :5432                         │   │  :9092              │   │  :6379              │
   └────────────────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### Rate Limiting (Token Bucket via Redis)

O `gateway-service` aplica limitação de taxa globalmente em todas as rotas com persistência distribuída via Redis:

| Parâmetro | Valor |
|---|---|
| **Algoritmo** | Token Bucket |
| **Taxa de reabastecimento** | 10 requisições / segundo |
| **Capacidade máxima (burst)** | 20 requisições |
| **Chave de resolução** | ID do usuário autenticado (`X-Usuario-Id`) → fallback por IP do cliente |
| **Resposta ao exceder** | `429 Too Many Requests` com headers `X-RateLimit-*` padronizados |

### Comunicação Cross-Service

```
sinistros-service
  │
  ├── [Feign GET]            → segurados-service   (valida segurado ao registrar sinistro)
  ├── [Feign GET]            → apolices-service    (valida apólice ATIVA ao registrar sinistro)
  │
  ├── [Kafka PRODUCE/Outbox] sinistro.registrado              → notificacao-service
  ├── [Kafka PRODUCE/Outbox] sinistro.aprovado (X-Event-Id)   → liquidacao-service (Inbox desduplicado)
  ├── [Kafka PRODUCE/Outbox] sinistro.rejeitado               → notificacao-service
  ├── [Kafka PRODUCE/Outbox] sinistro.documentos-solicitados  → notificacao-service (alerta segurado no Portal)
  └── [Kafka PRODUCE/Outbox] sinistro.documento-adicionado    → notificacao-service (alerta analistas no Backoffice)

segurados-service
  └── [Feign POST]           → auth-service        (provisiona credenciais SEGURADO com CSPRNG)

liquidacao-service (Headless com Transactional Inbox)
  └── [Kafka PRODUCE]        pagamento.liquidado   → sinistros-service · notificacao-service
```

---

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Uso |
|---|:---:|---|
| **Java** | `21 LTS` | Linguagem principal — records, virtual threads, sealed classes, pattern matching |
| **Spring Boot** | `3.5.16` | Framework base de todos os 7 microsserviços |
| **Spring Cloud** | `2025.0.3` | Gateway (WebFlux reativo), OpenFeign e Resilience4j |
| **Spring Cloud Gateway** | via BOM | Ponto único de entrada — roteamento, autenticação JWT, rate limiting e injeção de Correlation ID |
| **Spring Cloud OpenFeign** | via BOM | Comunicação REST síncrona declarativa entre serviços downstream |
| **Resilience4j** | via BOM | Circuit Breaker e Retry nas chamadas Feign |
| **Apache Kafka** | `3.7 (KRaft)` | Broker de mensagens distribuído e de alta vazão — sem dependência de ZooKeeper |
| **Spring Kafka** | via BOM | Producers e consumers com serialização JSON tipada e propagação de headers |
| **Spring Data JPA + Hibernate** | via BOM | Persistência relacional no modo `validate` — schema 100% gerenciado pelo Flyway |
| **Flyway** | via BOM | Migrações versionadas (`V1__…`, `V2__…`) em todos os microsserviços com banco |
| **Spring Boot Actuator** | via BOM | Health checks granulares (Postgres, Redis, Kafka, Disco) e rotas dinâmicas do Gateway |
| **MapStruct** | `1.5.5.Final` | Geração de mappers Domain ↔ DTO ↔ Entity em tempo de compilação |
| **Lombok** | via BOM | Eliminação de boilerplate (getters, builders, construtores) |
| **Spring Data Redis (Reactive)** | via BOM | Cache distribuído com `BasicPolymorphicTypeValidator` (whitelist estrita anti-RCE) + Rate Limiting distribuído no Gateway |
| **Spring Security + jjwt** | `0.12.6` | Autenticação, emissão de JWT, filtros padronizados `OncePerRequestFilter` e contexto isolado no MDC |
| **springdoc-openapi** | via BOM | Documentação OpenAPI 3 desacoplada em interfaces de contrato (`*ControllerDocs`) |
| **PostgreSQL** | `16` | Banco de dados relacional — 6 databases totalmente isolados |
| **Redis** | `7` | Cache in-memory e controle do token bucket rate limiter |
| **Testcontainers** | via BOM | PostgreSQL 16 e Kafka 3.7 (`ConfluentKafkaContainer`) reais sob demanda nos testes de integração |
| **JUnit 5 + Mockito** | via BOM | Testes unitários puros sem carregar contexto Spring (`@MockitoBean` / `@MockitoSpyBean`) |

### Frontend

| Tecnologia | Versão | Uso |
|---|:---:|---|
| **React** | `19.2.8` | Biblioteca de UI com `ref` nativo como prop, Context API direto sem `.Provider` e Concurrent Features |
| **TypeScript** | `6.0.2` | Tipagem estática rigorosa em toda a base de código |
| **Vite** | `8.2.0` | Build tool e dev server ultrarrápido com Hot Module Replacement (HMR) |
| **Tailwind CSS** | `v4.3.3` | Compilação nativa de alta velocidade com `@tailwindcss/vite` e design tokens em CSS variables |
| **TanStack Query** | `5.101.4` | Cache client-side assíncrono, refetch e sincronização de estado com o servidor |
| **React Hook Form** | `7.85.0` | Gerenciamento de formulários performático e não-controlado |
| **Zod** | `4.4.3` | Validação schema-based em runtime e inferência automática de tipos TypeScript |
| **React Router** | `7.18.2` | Roteamento declarativo SPA com proteção por papel (RBAC AuthGuard) |
| **Axios** | `1.19.0` | Cliente HTTP com interceptors para tokens JWT e Correlation ID |
| **Vitest** | `5.0.1` | Test runner nativo do Vite de alta performance |
| **React Testing Library** | `16.3.3` | Testes de componentes focados no comportamento e acessibilidade |

### Infraestrutura

| Tecnologia | Versão | Uso |
|---|:---:|---|
| **Docker** | `24+` | Container runtime |
| **Docker Compose** | `v2` | Orquestração local completa da infraestrutura e dos microsserviços |
| **Nginx** | `Alpine` | Servidor web HTTP e reverse proxy para a SPA com fallback para `index.html` |
| **Kafka UI** | `latest` | Dashboard web para inspeção visual de tópicos, partições e offsets |

---

## Microsserviços

| Serviço | Porta | Tipo | Responsabilidade |
|---|:---:|---|---|
| `gateway-service` | **8080** | Roteamento | Ponto único de entrada — validação de JWT, rate limiting (Redis), injeção de `X-Correlation-Id` e roteamento downstream |
| `auth-service` | **8084** | Transversal | Autenticação, emissão/renovação de JWT, RBAC hierárquico e gerador CSPRNG de senhas para segurados |
| `segurados-service` | **8085** | Domínio | CRUD de segurados (PF/PJ) e orquestração de provisionamento de usuário via Feign no `auth-service` |
| `apolices-service` | **8086** | Domínio | Gestão de apólices, coberturas securitárias e controle estrito de vigência |
| `sinistros-service` | **8087** | Núcleo | Ciclo de vida completo do sinistro, validação anti-IDOR e Transactional Outbox Pattern |
| `liquidacao-service` | **8088** | Worker Kafka | Consome `sinistro.aprovado`, desduplica via **Transactional Inbox** (idempotência estrita), liquida e emite `pagamento.liquidado` |
| `notificacao-service` | **8089** | Domínio / Eventos | Consome eventos do ciclo de vida, persiste notificações in-app (B2B/B2C) e expõe API REST |

> `liquidacao-service` é o único processo **headless** do sistema — sem endpoints REST de negócio, operando puramente como Kafka consumer protegido por Transactional Inbox. O `notificacao-service` possui banco de dados próprio (`notificacao_db`), migrações versionadas via Flyway e API REST (`/api/v1/notificacoes`) para consumo pelo Backoffice e Portal do Segurado.

### Bancos de Dados — Database-per-Service

Cada serviço possui seu próprio banco de dados PostgreSQL. **Não existem foreign keys entre bancos** — a consistência eventual e a integridade referencial são garantidas via eventos Kafka e validações síncronas via OpenFeign.

| Database | Serviço | Tabelas Principais |
|---|---|---|
| `auth_db` | auth-service | `usuarios` |
| `segurados_db` | segurados-service | `segurados` |
| `apolices_db` | apolices-service | `apolices`, `coberturas` |
| `sinistros_db` | sinistros-service | `sinistros`, `documentos_sinistro`, `historico_sinistro`, `outbox_events` |
| `liquidacao_db` | liquidacao-service | `eventos_pagamento`, `inbox_events` |
| `notificacao_db` | notificacao-service | `notificacoes` |

---

## Fluxo de Negócio

### Ciclo de Vida do Sinistro

```
  ┌──────────────┐     ┌─────────────┐     ┌────────────────────────┐
  │  REGISTRADO  │────►│  EM_ANALISE │────►│  AGUARDANDO_DOCUMENTOS │
  └──────────────┘     └──────┬──────┘     └───────────┬────────────┘
                              │                         │
                   ┌──────────┴─────────────────────────┘ (documento anexado)
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
   ┌──────────┐         ┌───────────┐
   │ APROVADO │         │ REJEITADO │
   └────┬─────┘         └───────────┘
        │
 (Kafka via Outbox: sinistro.aprovado)
        │
        ▼
    ┌──────┐
    │ PAGO │
    └──────┘
```

### Happy Path e Ciclo de Vida Entre Serviços

```
 1. Analista registra sinistro
    ├── [Feign GET] → segurados-service (valida segurado existente)
    └── [Feign GET] → apolices-service (valida apólice ATIVA)

 2. Sinistro persistido com status: REGISTRADO
    └── [Outbox ➔ Kafka] sinistro.registrado → notificacao-service

 3. Analista assume a regulação técnica
    └── Status → EM_ANALISE

 4. Analista solicita documentação adicional (se aplicável)
    ├── [PATCH] /api/v1/sinistros/{id}/aguardar-documentos
    ├── Status → AGUARDANDO_DOCUMENTOS
    ├── [Outbox ➔ Kafka] sinistro.documentos-solicitados → notificacao-service
    └── 🔔 Sininho acende no Portal do Segurado (B2C) com link direto para upload

 5. Segurado envia o documento solicitado no Portal
    ├── [POST] /api/v1/sinistros/{id}/documentos
    ├── Status retorna automaticamente para → EM_ANALISE
    ├── [Outbox ➔ Kafka] sinistro.documento-adicionado → notificacao-service
    └── 🔔 Sininho acende no Backoffice Operacional (B2B) alertando o analista

 6. Analista aprova o sinistro
    ├── [PATCH] /api/v1/sinistros/{id}/aprovar
    ├── Status → APROVADO
    └── [Outbox ➔ Kafka] sinistro.aprovado → liquidacao-service

 7. liquidacao-service consome sinistro.aprovado
    ├── Processa a liquidação financeira do pagamento
    └── [Kafka PRODUCE] pagamento.liquidado

 8. sinistros-service consome pagamento.liquidado
    └── Status → PAGO

 9. notificacao-service consome pagamento.liquidado
    └── 🔔 Notificação persistida para o segurado confirmando a liquidação
```

### Tópicos Kafka

| Tópico | Producer | Consumers | Descrição |
|---|---|---|---|
| `sinistro.registrado` | sinistros-service | notificacao-service | Emitido na abertura do sinistro; gera notificação de registro |
| `sinistro.aprovado` | sinistros-service | liquidacao-service | Disparado na aprovação via Outbox; inicia liquidação de pagamento |
| `sinistro.rejeitado` | sinistros-service | notificacao-service | Emitido na rejeição técnica; notifica o segurado com justificativa |
| `sinistro.documentos-solicitados` | sinistros-service | notificacao-service | Analista solicita comprovantes; notifica o segurado no Portal B2C |
| `sinistro.documento-adicionado` | sinistros-service | notificacao-service | Segurado anexa documento; notifica analistas no Backoffice B2B |
| `pagamento.liquidado` | liquidacao-service | sinistros-service · notificacao-service | Confirmação da liquidação; altera sinistro para PAGO e notifica segurado |

---

## Frontend

SPA (Single Page Application) servida via Nginx, acessada exclusivamente pelo API Gateway em `:8080`. O frontend é dividido em dois contextos com design system consistente e controle estrito de sessão:

### Backoffice B2B (papéis: ADMIN, GESTOR, ANALISTA)

| Tela / Componente | Descrição |
|---|---|
| **Login** | Autenticação JWT — credenciais validadas no `auth-service` via gateway |
| **Sininho de Notificações (Header)** | `NotificationsPopover` exibe badge em tempo real com contagem de notificações não lidas (`lida_interno`) e alerta analistas/gestores quando segurados enviam documentos (`DOCUMENTO_RECEBIDO`), com clique que redireciona diretamente ao sinistro |
| **Dashboard Operacional** | Métricas agregadas cacheadas no Redis: total de sinistros, valores aprovados e em análise, taxa de conversão, tempo médio e fila por analista |
| **Sinistros** | Listagem paginada com filtros avançados, registro, aprovação/rejeição, atribuição de analista, solicitação de pendência documental e visualização do histórico de auditoria |
| **Apólices** | Listagem paginada com filtros por segurado/status, cadastro, edição e alteração de status |
| **Segurados** | Listagem paginada com filtros por nome, CPF e CNPJ; cadastro e edição (PF e PJ). Exibe as credenciais de acesso geradas para o segurado uma única vez |
| **Página 404 Institucional** | `NotFoundPage` exibe interface institucional amigável e acessível para rotas inválidas, com botão contextual de retorno imediato ao Dashboard operacional |

### Portal do Segurado B2C (papel: SEGURADO)

| Tela / Componente | Descrição |
|---|---|
| **Login do Portal** | Rota `/portal/login` — entrada exclusiva para segurados com validação de credenciais |
| **Sininho de Notificações (Header)** | `NotificationsPopover` filtrado para o `seguradoId`, com contagem isolada (`lida_segurado`), alertando imediatamente quando documentos adicionais forem solicitados (`DOCUMENTO_SOLICITADO`), com link direto para a tela de envio |
| **Dashboard do Segurado** | Visão consolidada pessoal: apólices vigentes, sinistros em andamento e status de liquidação financeira |
| **Minhas Apólices** | Listagem paginada com visualização somente leitura e detalhes das coberturas contratadas |
| **Meus Sinistros** | Listagem paginada, acompanhamento detalhado da linha do tempo e formulário para upload de documentos complementares |
| **Página 404 do Segurado** | URLs inválidas sob o escopo `/portal/*` preservam o contexto B2C e fornecem atalho seguro de retorno ao Dashboard do Segurado |

### Tipos de Notificação In-App e Isolamento por Perfil

As notificações contam com **duplo status de leitura no banco de dados (`lida_segurado` e `lida_interno`)**. Quando um segurado marca uma notificação como lida no Portal B2C, ela permanece não lida para os operadores do Backoffice B2B e vice-versa, garantindo que nenhuma ação operacional passe despercebida pela equipe técnica.

| Tipo | Destinatário | Gatilho | Ícone / Visual |
|---|---|---|---|
| `SINISTRO_REGISTRADO` | Segurado | Novo sinistro registrado no sistema | Azul (Info) |
| `DOCUMENTO_SOLICITADO` | Segurado | Analista coloca sinistro em pendência | Amarelo (Aviso) |
| `DOCUMENTO_RECEBIDO` | Analista / Gestor | Segurado anexou documento pelo Portal | Azul (Info) |
| `SINISTRO_REJEITADO` | Segurado | Sinistro foi indeferido na análise técnica | Vermelho (Alerta) |
| `PAGAMENTO_LIQUIDADO` | Segurado | Liquidação financeira concluída com sucesso | Verde (Sucesso) |

### Isolamento de Sessão por Aba & Validação Reativa de Roles

Para viabilizar que operadores transitem entre o **Backoffice** e o **Portal do Segurado** em abas simultâneas do navegador sem conflito de papéis nem sobreposição de cache:

* **Armazenamento com Prioridade em `sessionStorage`**: Cada aba mantém seu próprio token e papel de autenticação isolado em `sessionStorage`, recorrendo ao `localStorage` apenas como fallback de inicialização:

| Contexto | Chave Token | Chave Papel |
|---|---|---|
| **Backoffice** (`ADMIN` / `GESTOR` / `ANALISTA`) | `insurtech_token_internal` | `insurtech_role_internal` |
| **Portal do Segurado** (`SEGURADO`) | `insurtech_token_portal` | `insurtech_role_portal` |

* **Triggers Reativos de Sincronização (`storage` e `focus`)**:
  * Ao alternar ou focar uma aba (`window.addEventListener('focus')`), o `AuthContext` revalida instantaneamente a integridade do papel e do token para assegurar que a sessão ativa permanece consistente.
  * O listener de eventos de storage (`window.addEventListener('storage')`) monitora alterações de logout ou trocas de credenciais realizadas em abas irmãs.
* **Desconexão Segura e Purga de Cache contra Disputa**:
  * Caso uma inconsistência de papel seja identificada pelo guard `RotaProtegida` ou uma requisição receba `403 Forbidden` do API Gateway, a sessão da aba afetada é purgada (`limparTokens()`), o cache do React Query é esvaziado (`queryClient.clear()`) e o usuário é redirecionado imediatamente para a tela de login apropriada (`/login` ou `/portal/login`), eliminando telas em branco ou vazamento de estado.

### Paleta de Status de Sinistro

| Status | Significado | Ação / Próximo Passo |
|---|---|---|
| `REGISTRADO` | Aguardando atribuição de analista responsável | Analista assume regulação |
| `EM_ANALISE` | Em revisão técnica pelo analista | Solicitar documentos, aprovar ou rejeitar |
| `AGUARDANDO_DOCUMENTOS` | Documentação pendente do segurado | Segurado realiza upload no Portal (anexo bloqueado em outros status) |
| `APROVADO` | Aprovado tecnicamente — aguardando liquidação | Evento emitido via Outbox para o Kafka |
| `REJEITADO` | Sinistro encerrado com rejeição fundamentada | Processo finalizado com notificação |
| `PAGO` | Liquidação financeira concluída com sucesso | Pagamento registrado no histórico |

### Organização do Frontend (Feature-Sliced)

```
src/
├── api/                    # Clientes HTTP (Axios) com suporte a import.meta.env.VITE_API_URL e interceptor 403
├── context/                # AuthContext — autenticação reativa, listeners de storage/focus e purga de cache
├── hooks/                  # useNotificacoes (polling em background 3s, BroadcastChannel cross-tab)
├── utils/
│   └── tokenStorage.ts     # Isolamento de tokens e papéis por contexto com prioridade sessionStorage
├── features/
│   ├── sinistros/          # hooks · components (timeline, modal, anexo condicional) · schemas · types
│   ├── apolices/           # hooks · components · schemas · types
│   ├── segurados/          # hooks · components · schemas · types
│   ├── dashboard/          # hooks · components (métricas, timeline de microsserviços, KPIs)
│   └── portal-segurado/    # Portal B2C — páginas, layout, timeline e upload de documentos
├── pages/                  # Composição das features (Dashboard, Sinistros, Apólices, Segurados, NotFoundPage)
├── components/             # Primitivos UI compartilhados (layout, HeaderSearch, NotificationsPopover, modais)
└── routes/                 # Configuração de rotas (AppRouter) + RotaProtegida (RBAC guard reativo)
```

---

## Estrutura do Projeto

```
insurtech/
├── backend/
│   ├── auth-service/            # Autenticação, gestão de usuários, RBAC hierárquico e gerador CSPRNG
│   ├── segurados-service/       # CRUD de segurados (PF/PJ) e orquestração de usuário via Feign
│   ├── apolices-service/        # Apólices, coberturas securitárias e vigência
│   ├── sinistros-service/       # Núcleo: ciclo de vida do sinistro, anti-IDOR e Transactional Outbox
│   ├── liquidacao-service/      # Worker Kafka headless: processamento de liquidações financeiras
│   ├── notificacao-service/     # Consumo de eventos Kafka, persistência (PostgreSQL) e API REST
│   └── gateway-service/         # API Gateway reativo (WebFlux, Redis Rate Limiting, Correlation ID)
│
├── frontend/                    # React 19 + Vite 8 + TypeScript 6 + Tailwind v4
│   ├── src/                     # Código-fonte (arquitetura feature-sliced)
│   ├── .env.example             # Configuração da URL do Gateway (VITE_API_URL)
│   ├── Dockerfile               # Multi-stage build: Node 22 (build) + Nginx Alpine (serve)
│   └── nginx.conf               # SPA fallback — redirecionamento de todas as rotas para index.html
│
├── .env.example                 # Modelo de variáveis de ambiente para infra, portas e segredos
├── docker-compose.yml           # Orquestração local completa parametrizada com variáveis de ambiente
├── init-databases.sql           # Criação dos 6 databases no PostgreSQL (auth, segurados, apolices, sinistros, liquidacao, notificacao)
├── OUTBOX_PATTERN.md            # Guia técnico consolidado: Transactional Outbox Pattern
├── INBOX_PATTERN.md             # Guia técnico consolidado: Transactional Inbox Pattern & Idempotência Kafka
├── OBSERVABILIDADE.md           # Guia técnico consolidado: Observabilidade Leve Distribuída
├── NOTIFICACAO_DOCUMENTOS.md    # Guia técnico consolidado: Ciclo Bidirecional de Notificações
├── README.md                    # Documentação oficial do projeto (Português)
└── README.en.md                 # Official project documentation (English)
```

### Estrutura Interna — Clean Architecture por Serviço

```
<service>/src/main/java/com/insurtech/<domain>/
│
├── domain/                      # Núcleo puro — zero dependência de frameworks externos
│   ├── model/                   # Entidades e Value Objects
│   ├── event/                   # Domain Events (ex.: SinistroAprovadoEvent, DocumentosSolicitadosEvent)
│   ├── exception/               # Exceções de negócio (nomes em português)
│   └── repository/              # Interfaces de repositório (ports de saída)
│
├── application/                 # Casos de uso — orquestra domínio e ports
│   ├── usecase/                 # Um arquivo por caso de uso (SRP)
│   ├── dto/                     # Request / Response DTOs
│   ├── port/                    # Input ports (interfaces dos use cases) e Output ports (EventPublisherPort)
│   └── validator/               # Validadores de segurança centralizados (ex.: SinistroSecurityValidator)
│
├── infrastructure/              # Adapters de saída (implementações técnicas)
│   ├── persistence/             # JPA entities · Flyway migrations · repositórios · outbox/inbox entities
│   ├── messaging/               # Kafka producers, consumers e OutboxEventRelay (@Scheduled)
│   ├── client/                  # OpenFeign clients com Resilience4j para comunicação cross-service
│   ├── mapper/                  # MapStruct 1.5.5 (Domain ↔ DTO ↔ JPA Entity)
│   ├── security/                # UserContextFilter (OncePerRequestFilter + SLF4J MDC) · UserContextHolder
│   ├── cache/                   # Redis — cache com BasicPolymorphicTypeValidator anti-RCE
│   └── config/                  # Configurações técnicas (Kafka, Redis, OpenAPI, Feign, Actuator)
│
└── interfaces/                  # Adapters de entrada (HTTP)
    ├── controller/              # REST Controllers desacoplados via *ControllerDocs (OpenAPI 3)
    └── exception/               # GlobalExceptionHandler padronizado por serviço
```

---

## Como Executar

### Pré-requisitos

| Ferramenta | Versão mínima | Uso |
|---|:---:|---|
| **Docker** | `24+` | Container runtime |
| **Docker Compose** | `v2+` | Orquestração local |
| **Java** | `21` | Build e execução manual dos serviços backend |
| **Node.js** | `22` | Desenvolvimento e execução do frontend |

---

### Opção 1 — Docker Compose *(recomendado)*

Sobe toda a infraestrutura, os microsserviços e o frontend com um único comando:

```bash
# Clone o repositório
git clone https://github.com/kau4dev/insurtech.git
cd insurtech

# Configura as variáveis de ambiente a partir dos templates de exemplo
cp .env.example .env
cp frontend/.env.example frontend/.env

# Sobe toda a infraestrutura + microsserviços + frontend
docker compose up --build
```

Após a inicialização, acesse os recursos da plataforma:

| Recurso | URL | Descrição |
|---|---|---|
| **Frontend (Backoffice & Portal)** | http://localhost:5173 | Aplicação React 19 (SPA) |
| **API Gateway** | http://localhost:8080 | Ponto único de entrada da API |
| **Actuator — Health Gateway** | http://localhost:8080/actuator/health | Health check detalhado (Redis, disco, status geral) |
| **Actuator — Gateway Routes** | http://localhost:8080/actuator/gateway/routes | Rastreamento dinâmico de rotas e filtros |
| **Kafka UI** | http://localhost:8081 | Monitoramento visual de tópicos e partições |
| **Swagger — sinistros** | http://localhost:8087/swagger-ui.html | Documentação REST do sinistros-service |
| **Swagger — segurados** | http://localhost:8085/swagger-ui.html | Documentação REST do segurados-service |
| **Swagger — apólices** | http://localhost:8086/swagger-ui.html | Documentação REST do apolices-service |
| **Swagger — auth** | http://localhost:8084/swagger-ui.html | Documentação REST do auth-service |
| **Swagger — notificações** | http://localhost:8089/swagger-ui.html | Documentação REST do notificacao-service |

---

### Opção 2 — Desenvolvimento Local *(infra via Docker, serviços manuais)*

Ideal para desenvolvimento ativo com hot reload em cada serviço:

```bash
# 1. Configura as variáveis de ambiente locais
cp .env.example .env
cp frontend/.env.example frontend/.env

# 2. Sobe apenas a infraestrutura compartilhada
docker compose up -d postgres kafka redis kafka-ui

# 3. Inicia cada serviço backend (em terminais separados ou abas)
cd backend/auth-service        && ./mvnw spring-boot:run
cd backend/segurados-service   && ./mvnw spring-boot:run
cd backend/apolices-service    && ./mvnw spring-boot:run
cd backend/sinistros-service   && ./mvnw spring-boot:run
cd backend/liquidacao-service  && ./mvnw spring-boot:run
cd backend/notificacao-service && ./mvnw spring-boot:run
cd backend/gateway-service     && ./mvnw spring-boot:run

# 4. Inicia o frontend com HMR
cd frontend && npm install && npm run dev
```

> **Dica:** O `gateway-service` requer conexão com Redis para o Token Bucket. Certifique-se de que o Redis está rodando via `docker compose up -d redis`.

---

## Testes

### Backend (por serviço)

Cada microsserviço é testado de forma **completamente independente**, sem compilação cruzada ou dependência de root pom:

```bash
cd backend/<nome-do-servico>

# Testes unitários — ultrarrápidos, sem Docker, sem contexto Spring
./mvnw test -Dtest='*Test'

# Testes de integração — requer Docker rodando (Testcontainers)
./mvnw test -Dtest='*IT'

# Todos os testes do microsserviço
./mvnw test -Dtest='*Test,*IT'
```

> **Testcontainers:** os testes de integração (`*IT`) dos serviços com banco sobem automaticamente instâncias efêmeras de PostgreSQL 16 e Kafka 3.7. O `notificacao-service` utiliza H2 in-memory com `@EmbeddedKafka` para execução em tempo recorde no CI.

### Frontend

```bash
cd frontend

# Executa todos os testes unitários (Vitest 5)
npm test

# Modo watch interativo
npm run test:watch

# Verificação de tipos e build de produção
npm run build
```

### Cobertura Atual

| Módulo | Suite / Tecnologias | Testes | Status |
|---|---|:---:|:---:|
| `auth-service` | Unitários & Integração (Spring Boot 3.5 + Testcontainers PostgreSQL) | 50 | ✅ |
| `segurados-service` | Unitários & Integração (Spring Boot 3.5 + Testcontainers PostgreSQL) | 58 | ✅ |
| `apolices-service` | Unitários & Integração (Spring Boot 3.5 + Testcontainers PostgreSQL) | 47 | ✅ |
| `sinistros-service` | Unitários (59) + Integração Testcontainers Postgres & Kafka (28) + Validações | 130 | ✅ |
| `liquidacao-service` | Unitários & Idempotência Inbox Pattern (JUnit 5 + Mockito) | 7 | ✅ |
| `notificacao-service` | Unitários & Integração (H2 in-memory + EmbeddedKafka) | 18 | ✅ |
| `gateway-service` | Unitários (JUnit 5 + Reactor) + Integração (WebTestClient) | 24 | ✅ |
| **Total Backend** | **JUnit 5 + Mockito + Testcontainers (7 microsserviços)** | **334** | **✅** |
| **Frontend** | **Unitários, Hooks, Páginas & Componentes (Vitest 5 + React Testing Library)** | **186** | **✅** |
| **Total Geral** | **Suíte Automatizada Completa (Zero falhas / 100% aprovada)** | **520** | **✅** |

---

## Acessos e Credenciais

### PostgreSQL

| Parâmetro | Valor |
|---|---|
| **Host** | `localhost:5432` |
| **Usuário** | `insurtech` |
| **Senha** | `insurtech` |
| **Databases** | `auth_db` · `segurados_db` · `apolices_db` · `sinistros_db` · `liquidacao_db` · `notificacao_db` |

### Usuários de Teste *(seed inicial no `auth_db`)*

#### Backoffice (B2B)

| E-mail | Senha | Papel | Acesso |
|---|---|:---:|---|
| `admin@insurtech.com` | `password` | `ADMIN` | Irrestrito — gestão total da plataforma |
| `gestor@insurtech.com` | `password` | `GESTOR` | Dashboard operacional + supervisão |
| `analista@insurtech.com` | `password` | `ANALISTA` | Regulação de sinistros e operações |

#### Portal do Segurado (B2C)

Usuários do tipo `SEGURADO` são provisionados automaticamente durante o cadastro de um segurado (ou via endpoint administrativo `POST /api/v1/auth/usuarios`). A senha é gerada com algoritmo CSPRNG (`java.security.SecureRandom`) e exibida **estritamente uma única vez** no modal de criação.

> Credenciais acima são exclusivas para ambiente de desenvolvimento e testes. Não utilize senhas padrão em produção.

---

## Endpoints da API

Todos os endpoints são roteados via **API Gateway** em `http://localhost:8080`. O gateway valida o token JWT, injeta os cabeçalhos `X-Usuario-Id`, `X-Usuario-Papel` e `X-Correlation-Id`, e encaminha a requisição para os microsserviços downstream.

### Auth (`auth-service`)

| Método | Rota | Descrição | Auth |
|---|---|---|:---:|
| `POST` | `/api/v1/auth/login` | Autenticação — valida credenciais e emite JWT | — |
| `POST` | `/api/v1/auth/usuarios` | Cadastra usuário com RBAC hierárquico (ADMIN/GESTOR only) | JWT |
| `GET` | `/api/v1/auth/usuarios/{id}` | Busca dados do usuário por ID | JWT |
| `GET` | `/api/v1/auth/usuarios` | Lista usuários — filtro opcional por status `ativo` | JWT |
| `PATCH` | `/api/v1/auth/usuarios/{id}` | Reativa um usuário inativado | JWT |
| `DELETE` | `/api/v1/auth/usuarios/{id}` | Inativação lógica de usuário | JWT |

### Segurados (`segurados-service`)

| Método | Rota | Descrição | Auth |
|---|---|---|:---:|
| `POST` | `/api/v1/segurados` | Cadastra segurado (PF ou PJ) + provisiona usuário SEGURADO via Feign | JWT |
| `GET` | `/api/v1/segurados` | Lista paginada — filtros: `nome`, `cpf`, `cnpj` | JWT |
| `GET` | `/api/v1/segurados/{id}` | Detalhes completos do segurado | JWT |
| `PUT` | `/api/v1/segurados/{id}` | Atualiza dados cadastrais do segurado | JWT |

### Apólices (`apolices-service`)

| Método | Rota | Descrição | Auth |
|---|---|---|:---:|
| `POST` | `/api/v1/apolices` | Cria apólice vinculada a um segurado válido | JWT |
| `GET` | `/api/v1/apolices` | Lista paginada — filtros: `status`, `tipo`, `seguradoId` | JWT |
| `GET` | `/api/v1/apolices/{id}` | Detalhes da apólice com suas coberturas | JWT |
| `PATCH` | `/api/v1/apolices/{id}/status` | Altera status da apólice (ATIVA, CANCELADA, SUSPENSA) | JWT |

### Sinistros (`sinistros-service`)

| Método | Rota | Descrição | Auth |
|---|---|---|:---:|
| `POST` | `/api/v1/sinistros` | Registra sinistro (valida apólice ativa e segurado via Feign) | JWT |
| `GET` | `/api/v1/sinistros` | Lista paginada com filtros avançados (status, tipo, datas, analista) | JWT |
| `GET` | `/api/v1/sinistros/{id}` | Detalhes completos do sinistro e documentos anexados | JWT |
| `PATCH` | `/api/v1/sinistros/{id}/atribuir` | Atribui analista responsável pelo processo | JWT |
| `PATCH` | `/api/v1/sinistros/{id}/aguardar-documentos` | Coloca em pendência documental e emite evento Kafka via Outbox | JWT |
| `PATCH` | `/api/v1/sinistros/{id}/aprovar` | Aprova sinistro e dispara liquidação financeira via Outbox | JWT |
| `PATCH` | `/api/v1/sinistros/{id}/rejeitar` | Rejeita sinistro com justificativa fundamentada | JWT |
| `POST` | `/api/v1/sinistros/{id}/documentos` | Anexa documento ao sinistro (retorna para EM_ANALISE) | JWT |
| `GET` | `/api/v1/sinistros/{id}/historico` | Histórico completo de auditoria e mudanças de status | JWT |
| `GET` | `/api/v1/sinistros/dashboard/resumo` | Métricas operacionais consolidadas e cacheadas no Redis | JWT |

### Notificações (`notificacao-service`)

| Método | Rota | Descrição | Auth |
|---|---|---|:---:|
| `GET` | `/api/v1/notificacoes` | Lista notificações — filtros opcionais: `seguradoId`, `apenasNaoLidas` | JWT |
| `PATCH` | `/api/v1/notificacoes/{id}/lida` | Marca uma notificação específica como lida | JWT |
| `PATCH` | `/api/v1/notificacoes/marcar-todas-lidas` | Marca todas as notificações como lidas (geral ou por `seguradoId`) | JWT |

### Observabilidade & Actuator

| Método | Rota | Descrição | Auth |
|---|---|---|:---:|
| `GET` | `/actuator/health` | Health check detalhado (PostgreSQL, Redis, Kafka, Disco) em todos os 7 serviços | — / JWT |
| `GET` | `/actuator/gateway/routes` | Inspeção dinâmica das rotas e filtros do Gateway | — / JWT |
| `GET` | `/actuator/info` | Informações de versão e metadados da aplicação | — / JWT |

---

## Diferenciais Técnicos

### 1. Transactional Outbox Pattern (`sinistros-service`)

O maior desafio em sistemas distribuídos orientados a eventos é o problema de **Dual-Write Inconsistency**: salvar dados no banco relacional e publicar mensagens no Kafka não constituem uma operação atômica nativa. Se a escrita no banco for confirmada mas o Kafka falhar, o evento é perdido para sempre; se o evento for publicado primeiro mas o banco der rollback, eventos fantasmas circulam no ecossistema.

```
[Requisição HTTP]
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│  sinistros-service (Transação ACID atômica no PostgreSQL)    │
│  BEGIN TRANSACTION;                                          │
│    1. UPDATE sinistros SET status = 'APROVADO';              │
│    2. INSERT INTO outbox_events (topic, payload, 'PENDENTE');│
│  COMMIT;                                                     │
└──────────────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │ Poller assíncrono (@Scheduled)       │
            ▼                                     ▼
   [Lê eventos PENDENTE]                  [Kafka indisponível?]
            │                                     │
            ▼                                     ▼
   [Publica no Kafka com X-Event-Id]      [Mantém em disco e tenta de novo]
            │
            ▼
   [UPDATE outbox_events SET status = 'PROCESSADO']
```

* **Transação ACID Unificada**: A entidade de negócio e o registro do evento na tabela `outbox_events` são persistidos dentro da mesma transação física do PostgreSQL.
* **Tabela `outbox_events`**: Estruturada com índice composto `(status, created_at ASC)` para alta performance em polling:
  ```sql
  CREATE TABLE outbox_events (
      id UUID PRIMARY KEY,
      aggregate_type VARCHAR(50) NOT NULL,
      aggregate_id VARCHAR(100) NOT NULL,
      topic VARCHAR(100) NOT NULL,
      payload TEXT NOT NULL,
      correlation_id VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
      tentativas INT NOT NULL DEFAULT 0,
      erro TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      processed_at TIMESTAMP WITH TIME ZONE
  );
  ```
* **Relay Assíncrono (`OutboxEventRelay`)**: Componente `@Scheduled(fixedDelay = 2000)` que lê eventos pendentes em lotes (`BATCH_SIZE = 50`), despacha via `KafkaTemplate.send(record)` e marca como `PROCESSADO` de forma reativa (`whenComplete`).
* **Propagação do `X-Event-Id` Imutável**: O relay injeta o UUID imutável do evento do Outbox no cabeçalho Kafka `X-Event-Id`, viabilizando a desduplicação estrita no consumidor (Inbox Pattern).
* **Garantia At-Least-Once Delivery**: Se houver falha de rede ou timeout, o evento permanece como `PENDENTE`, incrementa a contagem de `tentativas` e é reenviado no próximo ciclo, caindo para `FALHA` após 5 tentativas sem sucesso.
* **Tolerância a Falhas e Resiliência Extrema**: Quando o Kafka está fora do ar (Kafka DOWN), a API HTTP responde `200 OK` imediatamente ao usuário, pois o evento está 100% resguardado no disco do PostgreSQL. Ao reiniciar o broker, o relay drena os eventos pendentes sem perda de dados.
* **Entidade JPA com Setters Explícitos**: Substituição de builders em entidades JPA por setters explícitos, garantindo ciclo de vida limpo e compatibilidade estrita com o Hibernate.
* 📖 *Guia consolidado passo a passo:* [`OUTBOX_PATTERN.md`](./OUTBOX_PATTERN.md)

---

### 2. Transactional Inbox Pattern (`liquidacao-service` — Idempotência Estrita)

O Apache Kafka oferece por padrão semântica de entrega **At-Least-Once** (pelo menos uma vez). Isso significa que mensagens podem ser reentregues em casos de retries do Outbox Relay, rebalanceamento de partições ou confirmações tardias de commit.

Em operações financeiras críticas — como a liquidação de sinistros — processar uma mensagem duplicada causaria pagamentos repetidos de dezenas de milhares de reais. Abordagens ingênuas baseadas em `topic-partition-offset` falham, pois retransmissões recebem novos offsets no broker.

O **Transactional Inbox Pattern** resolve isso de ponta a ponta:

```
  ┌──────────────────────────────────────────────────────────────┐
  │  sinistros-service (Produtor Outbox)                         │
  │  OutboxEventRelay despacha ProducerRecord com:               │
  │    - Header: X-Correlation-Id: <uuid>                       │
  │    - Header: X-Event-Id: <outbox_event_id> (UUID imutável)   │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ Kafka: sinistro.aprovado
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  liquidacao-service (Consumidor Inbox)                       │
  │                                                              │
  │  @KafkaListener extrai X-Event-Id                            │
  │  BEGIN TRANSACTION (liquidacao_db);                          │
  │                                                              │
  │    1. SELECT EXISTS FROM inbox_events                        │
  │       WHERE message_id = :eventId;                           │
  │                                                              │
  │    ┌─────────────────────────┴─────────────────────────┐     │
  │    ▼ [SE JÁ EXISTE]                                    ▼     │
  │  log.warn("Evento duplicado ignorado!");             [INÉDITO]│
  │  COMMIT (Descarta sem pagar novamente)                 │     │
  │                                                        │     │
  │    2. INSERT INTO inbox_events (message_id, ...);      │     │
  │    3. INSERT INTO eventos_pagamento (sinistro_id, ...);│     │
  │  COMMIT;                                               ▼     │
  │                                                              │
  │    4. Publica pagamento.liquidado no Kafka                   │
  └──────────────────────────────────────────────────────────────┘
```

* **Chave Primária de Mensagem (`message_id`)**: A tabela `inbox_events` armazena o `message_id` como `PRIMARY KEY`:
  ```sql
  CREATE TABLE inbox_events (
      message_id VARCHAR(100) PRIMARY KEY,
      consumer_name VARCHAR(100) NOT NULL,
      topic VARCHAR(100) NOT NULL,
      payload TEXT,
      correlation_id VARCHAR(100),
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      processed_at TIMESTAMP WITH TIME ZONE
  );
  ```
* **Transação ACID Atômica**: A gravação no inbox e a criação do registro de pagamento em `eventos_pagamento` ocorrem dentro da mesma transação física do PostgreSQL.
* **Skip Seguro de Duplicatas**: Se o `message_id` já existir com status `PROCESSADO`, o evento é descartado com log explicativo sem disparar nova liquidação e sem falhar o listener (evitando loop infinito de DLT).
* **Garantia Effectively-Once**: A combinação de *Transactional Outbox* no produtor com *Transactional Inbox* no consumidor garante que o evento seja processado exatamente uma única vez do ponto de vista do negócio.
* 📖 *Guia consolidado passo a passo:* [`INBOX_PATTERN.md`](./INBOX_PATTERN.md)

---

### 3. Observabilidade Leve Distribuída (Sem Containers Adicionais de APM)

A plataforma adota uma solução corporativa de observabilidade e rastreabilidade distribuída de alta eficiência, **sem necessidade de containers adicionais de APM (sem Prometheus, sem Grafana, sem Jaeger)** e com **baixíssimo overhead de memória na JVM**, operando nativamente via Correlation ID no SLF4J/MDC e logs estruturados unificados.

```
[Requisição HTTP]
        │
        ▼
┌────────────────────────────────────────────────────────┐
│  gateway-service (:8080)                               │
│  - CorrelationIdFilter (Gera X-Correlation-Id se vazio)│
│  - Injeta na requisição downstream                     │
│  - Devolve no cabeçalho HTTP da resposta               │
└──────────────────────────┬─────────────────────────────┘
                           │  HTTP com X-Correlation-Id
                           ▼
┌────────────────────────────────────────────────────────┐
│  sinistros-service (e outros serviços HTTP)             │
│  - UserContextFilter lê X-Correlation-Id ➔ MDC         │
│  - FeignConfig propaga X-Correlation-Id via REST       │
│  - Log imprime [sinistros-service, <correlationId>]    │
└──────────────────────────┬─────────────────────────────┘
                           │  Kafka Header: X-Correlation-Id
                           ▼
┌────────────────────────────────────────────────────────┐
│  liquidacao-service / notificacao-service              │
│  - Kafka Consumer lê X-Correlation-Id dos headers ➔ MDC│
│  - Log imprime [liquidacao-service, <correlationId>]   │
└────────────────────────────────────────────────────────┘
```

* **Correlation ID Ponta a Ponta**: O `gateway-service` (`CorrelationIdFilter`, ordem `-2`) gera um UUID único em `X-Correlation-Id` ou preserva o cabeçalho existente caso fornecido pelo cliente.
* **SLF4J MDC nos Filtros HTTP**: Em todos os microsserviços, o `UserContextFilter` extrai o `X-Correlation-Id`, popula o `MDC.put("correlationId", ...)` e garante limpeza rigorosa no bloco `finally` para evitar contaminação entre requisições na thread pool.
* **Propagação Síncrona via OpenFeign**: O interceptor em `FeignConfig` repassa `X-Correlation-Id`, `X-Usuario-Id` e `X-Usuario-Papel` automaticamente em todas as chamadas REST entre serviços.
* **Propagação Assíncrona via Kafka Headers**: `KafkaSinistroEventPublisher` e `OutboxEventRelay` gravam o Correlation ID nos cabeçalhos do Kafka (`RecordHeaders`). Os consumers (`liquidacao-service`, `notificacao-service`, `sinistros-service`) extraem o valor do record e hidratam o MDC da thread do consumidor.
* **Logs Padronizados e Coloridos**:
  ```properties
  logging.pattern.console=%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr([${spring.application.name:-},%X{correlationId:-},%X{usuarioId:-}]){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}
  ```
  Permite rastrear toda a jornada de uma requisição através dos múltiplos serviços com um comando simples no terminal:
  ```bash
  docker compose logs | grep "e4a7f01c-6b3a-4e89-a567-c1d9f8e43210"
  ```
* **Spring Boot Actuator Granular**: Exposição padronizada de `/actuator/health` detalhado em todos os 7 serviços (monitorando PostgreSQL, Redis, Kafka e Disco) e `/actuator/gateway/routes` no Gateway.
* 📖 *Guia consolidado passo a passo:* [`OBSERVABILIDADE.md`](./OBSERVABILIDADE.md)

---

### 4. Ciclo Bidirecional de Solicitação e Notificação de Documentos

A plataforma implementa um ciclo reativo e completo de comunicação entre o **Backoffice Operacional (B2B)** e o **Portal do Segurado (B2C)**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ FLUXO 1: Analista solicita documento ➔ Segurado é notificado           │
 └────────────────────────────────────────────────────────────────────────┘
 [Analista no Backoffice]
          │
          ▼ PATCH /api/v1/sinistros/{id}/aguardar-documentos
 ┌────────────────────────────────────────────────────────┐
 │ sinistros-service                                      │
 │ - Status ➔ AGUARDANDO_DOCUMENTOS                      │
 │ - Kafka PRODUCE via Outbox: documentos-solicitados     │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ notificacao-service                                    │
 │ - Persiste Notificação (DOCUMENTO_SOLICITADO)          │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 [Portal do Segurado (B2C)]
 🔔 Sininho toca no Portal! Badge de pendência e link direto para envio.


 ┌────────────────────────────────────────────────────────────────────────┐
 │ FLUXO 2: Segurado anexa documento ➔ Analista/Gestor é notificado       │
 └────────────────────────────────────────────────────────────────────────┘
 [Segurado no Portal]
          │
          ▼ POST /api/v1/sinistros/{id}/documentos
 ┌────────────────────────────────────────────────────────┐
 │ sinistros-service                                      │
 │ - Status retorna automaticamente para ➔ EM_ANALISE    │
 │ - Kafka PRODUCE via Outbox: documento-adicionado       │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ notificacao-service                                    │
 │ - Persiste Notificação (DOCUMENTO_RECEBIDO)            │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 [Backoffice Operacional (B2B)]
 🔔 Sininho toca no Header do Backoffice! Analista clica e regula o sinistro.
```

* **Fluxo B2B ➔ B2C**: O analista coloca o sinistro em pendência (`PATCH /api/v1/sinistros/{id}/aguardar-documentos`). O evento `sinistro.documentos-solicitados` é emitido via Outbox. O `notificacao-service` persiste o registro e o sininho do Portal do Segurado acende com o badge de contagem e link direto para o formulário de envio.
* **Fluxo B2C ➔ B2B**: O segurado realiza o upload do arquivo (`POST /api/v1/sinistros/{id}/documentos`). O status do sinistro retorna automaticamente para `EM_ANALISE`. O evento `sinistro.documento-adicionado` é emitido via Outbox. O `notificacao-service` persiste a notificação e o sininho do Backoffice alerta a equipe operacional para retomar a análise técnica.
* **Popovers Reativos (`NotificationsPopover`)**: Componente de interface no header com contagem em tempo real, filtros por papel, marcação individual ou em lote como lida e redirecionamento com um clique.
* 📖 *Guia consolidado passo a passo:* [`NOTIFICACAO_DOCUMENTOS.md`](./NOTIFICACAO_DOCUMENTOS.md)

---

### 5. Provisionamento B2B de Usuários e Geração de Senhas de Alta Entropia

A segurança de acesso e criação de identidades segue padrões corporativos estritos de conformidade:

* **RBAC Hierárquico Estrito (`POST /api/v1/auth/usuarios`)**:
  * `ADMIN` é a conta raiz do ecossistema, criada exclusivamente via migration inicial (`V1__create_usuarios.sql`). A criação de novos administradores via API é estritamente proibida.
  * Operadores `ADMIN` e `GESTOR` possuem permissão para provisionar novos usuários nos papéis `GESTOR`, `ANALISTA` e `SEGURADO`.
  * Usuários com papéis `ANALISTA` e `SEGURADO` são proibidos de provisionar qualquer usuário.
* **Geração de Senhas com CSPRNG (`GeradorSenhaService`)**:
  * Para o papel `SEGURADO`, qualquer senha informada na requisição é ignorada. O sistema gera credenciais seguras utilizando `java.security.SecureRandom` (CSPRNG — Cryptographically Secure Pseudo-Random Number Generator), garantindo ao menos uma letra maiúscula, uma minúscula, um dígito numérico e um símbolo especial em um total de 12+ caracteres.
  * Os caracteres são embaralhados através do algoritmo **Fisher-Yates Shuffle**. Nunca se utiliza `java.util.Random`.
* **Exposição Única e Hash Seguro**:
  * A senha gerada em texto claro é retornada **estritamente uma única vez** no payload de resposta (`UsuarioCriadoResponseDTO`) para que o operador a transmita ao segurado.
  * A senha nunca é gravada em texto claro nem registrada em logs. No banco `auth_db`, o hash é persistido com BCrypt (strength 12).
* **Orquestração Automática no Cadastro de Segurados**:
  * Ao cadastrar um segurado no `segurados-service`, caso o campo `usuarioId` seja omitido, o serviço aciona automaticamente o `AuthClient` via OpenFeign, provisiona o usuário no `auth-service` e vincula o identificador retornado de forma transparente.

---

### 6. Centralized Security Validator Pattern & Anti-IDOR

Para evitar dispersão e duplicação de lógica de segurança e garantir proteção total contra Insecure Direct Object References (IDOR):

* **Componente Especializado (`SinistroSecurityValidator`)**:
  Nenhum UseCase realiza validações de contexto ou checagens manuais de papel diretamente. O componente centraliza:
  * `validarAutenticacao()`: Garante presença e preenchimento de `X-Usuario-Id`.
  * `validarPapeis(String... papeisPermitidos)`: Garante que o papel do usuário (`X-Usuario-Papel`) pertença à lista autorizada.
  * `validarPropriedadeSegurado(seguradoId, mensagem)`: Garante que requisições originadas pelo Portal do Segurado (`SEGURADO`) só acessem ou filtrem recursos pertencentes ao seu próprio `seguradoId` verificado no `segurados-service`.
  * `buscarEValidarPropriedadeSegurado(seguradoId, mensagem)`: Busca o segurado via Feign e valida a titularidade do recurso contra o `X-Usuario-Id` do contexto de segurança.
* **Isolamento de Sessão no Frontend**:
  Tokens JWT gerenciados com prioridade em `sessionStorage` por aba e chaves dedicadas (`insurtech_token_internal` para B2B e `insurtech_token_portal` para B2C), com fallback de persistência em `localStorage` para evitar deslogamentos acidentais e prevenir contaminação cruzada quando o mesmo operador utiliza o Backoffice e o Portal em abas simultâneas.
* **Database-per-Service com 6 Databases Isolados**:
  `auth_db`, `segurados_db`, `apolices_db`, `sinistros_db`, `liquidacao_db`, `notificacao_db`. Zero acoplamento por foreign keys físicas entre microsserviços.

---

### 7. Serialização Segura de Cache com Polymorphic Type Validator

Para mitigar vulnerabilidades críticas de **Remote Code Execution (RCE)** associadas à desserialização polimórfica irrestrita em caches distribuídos Redis, o `sinistros-service` substitui métodos depreciados por um validador de tipos restrito:

* **Whitelist Estrita de Pacotes**:
  ```java
  PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
          .allowIfBaseType("com.insurtech.")
          .allowIfBaseType("java.util.")
          .allowIfBaseType("java.time.")
          .allowIfBaseType("java.math.")
          .build();
  ```
* **Builder Moderno do Spring Data Redis**:
  ```java
  GenericJackson2JsonRedisSerializer serializer = GenericJackson2JsonRedisSerializer.builder()
          .defaultTyping(ptv)
          .build();
  ```
  Impede a injeção maliciosa de gadgets em tempo de execução, preservando a serialização correta de DTOs, coleções, `BigDecimal` e tipos temporais do Java 21 (`Instant`, `LocalDate`).
* **Invalidação Reativa**:
  Métricas e resumos consolidados do dashboard são cacheados e invalidados automaticamente através de eventos de mudança de status (`@CacheEvict`).

---

### 8. Arquitetura de Filtros HTTP com OncePerRequestFilter & OpenAPI Desacoplado

* **Execução Estritamente Única (`OncePerRequestFilter`)**:
  Todos os filtros de autenticação e contexto de usuário (`UserContextFilter`) nos microsserviços estendem `OncePerRequestFilter`. Isso previne re-execuções indesejadas em requisições que realizam dispatches internos (como encaminhamentos de erro ou forwards assíncronos), garantindo que a injeção e limpeza de contexto no MDC ocorram exatamente uma vez por requisição HTTP.
* **Contratos OpenAPI 3 Desacoplados (`*ControllerDocs`)**:
  Todos os controllers REST implementam interfaces de documentação dedicadas (ex.: `SinistroControllerDocs`, `NotificacaoControllerDocs`, `SeguradoControllerDocs`, `ApoliceControllerDocs`, `AuthControllerDocs`).
  * As anotações de OpenAPI (`@Operation`, `@ApiResponse`, `@Parameter`, `@Tag`) residem exclusivamente nas interfaces.
  * As classes controladoras mantêm código enxuto, limpo e 100% focado no fluxo da aplicação e orquestração dos casos de uso.

---

### 9. Frontend Moderno — React 19 & Tailwind CSS v4 Nativo

* **Eliminação de `forwardRef` em Favor de `ref` Nativo**:
  No React 19, componentes recebem `ref` diretamente como prop sem necessidade de `React.forwardRef`. Todos os componentes base de formulário (`Input`, `Select`, `Textarea`) foram modernizados para o padrão nativo, reduzindo código e complexidade de tipos.
* **Context API Direto sem `.Provider`**:
  O `AuthContext` adota a sintaxe nativa `<AuthContext value={...}>`, eliminando a necessidade da propriedade `.Provider`.
* **Tailwind CSS v4 Nativo**:
  Adoção do compilador moderno do Tailwind CSS v4 via `@tailwindcss/vite`, eliminando completamente dependências legadas de PostCSS e Autoprefixer com tempo de compilação instantâneo.
* **RBAC Declarativo (`RotaProtegida`)**:
  Guarda de rotas declarativa validando os papéis permitidos (`ALLOWED_ROLES`) antes de renderizar qualquer componente sensível.
* **Página 404 Institucional e Resiliente (`NotFoundPage`)**:
  Interface amigável com rotas catch-all e suporte a subrotas do Portal do Segurado, garantindo retorno seguro ao Dashboard adequado e 100% de cobertura de testes.
* **Regras de Negócio e Componentes Visuais Robustos**:
  Condição estrita de anexo de documentos operacionais restrita a sinistros em status `AGUARDANDO_DOCUMENTOS` com analista atribuído, seletores enxutos com preview limpo do número do sinistro e badges de status e timeline imunes a quebras visuais (`whitespace-nowrap shrink-0`).

---

### 10. Padronização Global de Testes com `@DisplayName` e Testcontainers

* **`@DisplayName` Expressivo em 100% dos Testes**:
  Todos os métodos de testes unitários e de integração nos 7 microsserviços foram padronizados com anotações `@DisplayName` em português claro e descritivo (ex.: `@DisplayName("Deve desduplicar e ignorar evento já liquidado")`), facilitando a leitura de relatórios e a depuração em esteiras de CI/CD.
* **Spring Boot 3.5 Mocking Standard**:
  Substituição completa das anotações legadas `@MockBean` e `@SpyBean` pelas anotações modernas `@MockitoBean` e `@MockitoSpyBean` de `org.springframework.test.context.bean.override.mockito.*`.
* **Testcontainers com Confluent Kafka & PostgreSQL**:
  Testes de integração utilizam instâncias reais e efêmeras via Docker com `ConfluentKafkaContainer` e `@ServiceConnection`, garantindo que o comportamento em testes seja idêntico ao ambiente de produção.
* **520 Testes Automatizados com Zero Falhas**:
  334 testes backend + 186 testes frontend executando com 100% de sucesso.

---

### 11. Gerenciamento Unificado de Ambientes com .env e Docker Compose

* **Parametrização Desacoplada e Segura**:
  Toda a infraestrutura do Docker Compose (`docker-compose.yml`) é parametrizada com variáveis de ambiente e valores padrão de segurança (`${VAR:-default}`), cobrindo portas dos serviços, credenciais do PostgreSQL, Kafka, Redis e segredos de JWT.
* **Modelos Padronizados (`.env.example`)**:
  Disponibilização de arquivos de template versionados (`.env.example` na raiz e `frontend/.env.example`), permitindo rápida inicialização sem expor segredos sensíveis.
* **Consumo Centralizado no Frontend**:
  O cliente HTTP (`axiosClient.ts`) consome `import.meta.env.VITE_API_URL` com fallback seguro para `http://localhost:8080`, facilitando a troca transparente de endpoints entre desenvolvimento local, containers e ambientes de homologação/produção.
* **Higiene de Versionamento**:
  Arquivos `.env` locais são estritamente ignorados pelo `.gitignore`, prevenindo vazamentos acidentais de credenciais em repositórios remotos.

---

### 12. Isolamento de Sessão por Aba e Trigger Reativo Cross-Tab

* **Armazenamento com Prioridade em `sessionStorage`**:
  O `tokenStorage.ts` gerencia credenciais e papéis com preferência pelo `sessionStorage`, isolando cada aba do navegador. Esse design permite que um operador trabalhe simultaneamente como Analista no Backoffice (`ADMIN`/`GESTOR`/`ANALISTA`) e como Segurado no Portal B2C (`SEGURADO`) sem que o token de uma aba sobrescreva o da outra.
* **Triggers Reativos de Validação de Papel (`storage` e `focus`)**:
  * Ao focar novamente uma aba (`window.addEventListener('focus')`), o sistema valida se as credenciais locais ainda estão ativas e consistentes com o contexto atual.
  * O listener de eventos `storage` detecta logouts globais ou mudanças críticas de credenciais disparadas por abas irmãs.
* **Prevenção Ativa de Conflitos e Invalidação de Cache**:
  Caso uma requisição receba `HTTP 403 Forbidden` ou ocorra divergência de perfil entre o contexto da rota e a sessão ativa, o sistema executa a purga imediata dos dados em cache (`queryClient.clear()`), limpa os tokens da aba e redireciona o usuário de forma suave para a tela de autenticação correspondente (`/login` ou `/portal/login`), eliminando estados inconsistentes, dados residuais ou telas em branco.

---

### 13. Isolamento de Leitura de Notificações por Perfil e Sincronização em Tempo Real

* **Duplo Status de Leitura no Banco de Dados (`V2__adicionar_leitura_por_perfil.sql`)**:
  A tabela `notificacoes` no `notificacao_db` implementa colunas dedicadas `lida_segurado` e `lida_interno` com índices parciais de alta performance. Quando o segurado marca uma notificação como lida no Portal B2C, ela permanece não lida para a regulação técnica interna no Backoffice B2B e vice-versa, eliminando o risco de um perfil apagar inadvertidamente os alertas pendentes do outro.
* **Sincronização Reativa Cross-Tab (`BroadcastChannel`)**:
  Implementação do canal nativo do navegador `insurtech_notificacoes_channel`. Quando uma aba realiza qualquer mutação no sistema — como abertura de sinistro (`useCadastrarSinistro`, `AbrirSinistroWizard`), aprovação técnica (`useAprovarSinistro`), rejeição (`useRejeitarSinistro`), solicitação de documentos (`useAguardarDocumentos`), upload de comprovante (`useAdicionarDocumento`, `PortalSinistroDetailPage`) ou marcação de leitura — todas as outras abas e janelas abertas simultaneamente recebem o sinal em milissegundos e invalidam seu cache (`queryClient.invalidateQueries({ queryKey: ["notificacoes"] })`).
* **Background Polling Resiliente (Zero Interrupção)**:
  O hook `useNotificacoes` opera com polling contínuo a cada 3 segundos (`pollingIntervalMs = 3000`), com `refetchIntervalInBackground: true` e `staleTime: 0`. Mesmo se uma aba estiver em segundo plano ou inativa durante testes operacionais, os badges e contadores atualizam de forma autônoma sem requerer recarregamento da página (F5) ou cliques no sino.

---

### 14. Validação Robusta de Estado em Formulários com Acessibilidade Nativa

* **Controle de Estado `is-touched` e Validação Inline**:
  Todos os componentes primitivos de formulário (`Input`, `Select`, `Textarea`) contam com controle de estado que aciona feedback visual apenas após interação do usuário (blur ou tentativa de envio), prevenindo alertas prematuros e proporcionando uma experiência de preenchimento limpa e profissional.
* **Semântica e Acessibilidade (WCAG 2.1 AA)**:
  Integração completa com atributos `aria-invalid`, `aria-describedby` e pseudoclasses modernas como `:user-invalid`, associando mensagens de erro contextuais diretamente aos controles e garantindo contraste ideal conforme o design system.
* **Prevenção Ativa de Envios Inválidos**:
  Formulários como o assistente em etapas de abertura de sinistro (`AbrirSinistroWizard`), cadastro de apólices e upload de documentos contam com validação antecipada, `FormErrorBanner` descritivo e foco automático no primeiro elemento inválido.

---

## Licença

Este projeto é desenvolvido para fins **educacionais e de portfólio profissional**.

---

<div align="center">
<sub>Java 21 · Spring Boot 3.5 · React 19 · Apache Kafka 3.7 · PostgreSQL 16 · Redis 7 · Docker</sub>
</div>
