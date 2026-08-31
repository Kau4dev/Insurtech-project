# Guia de Desenvolvimento — Frontend InsurTech

> Stack: **React 19 · TypeScript · Vite 8 · Tailwind v4 · TanStack Query · React Hook Form + Zod**  
> Único ponto de entrada: `gateway-service` em `:8080` → `http://localhost:8080/api/v1/**`

---

## Estado atual do projeto

| Camada | Status |
|---|---|
| `src/api/` — clientes HTTP | ✅ Pronto |
| `src/interfaces/` — tipos TypeScript | ✅ Pronto |
| `src/context/` — AuthContext | ⬜ A fazer |
| `src/components/layout/` — AppLayout, Sidebar | ⬜ A fazer |
| `src/routes/` — rotas protegidas | ⬜ A fazer |
| `src/features/segurados/` | ⬜ A fazer |
| `src/features/apolices/` | ⬜ A fazer |
| `src/features/sinistros/` | ⬜ A fazer |
| `src/pages/DashboardPage` | ⬜ A fazer |

---

## Regras inegociáveis

- **Um único client HTTP:** [`axiosClient.ts`](src/api/axiosClient.ts) com `baseURL = http://localhost:8080/api/v1`. Não crie outros.
- **Sem novas dependências de estado/formulário/data-fetch.** Já instaladas: `axios`, `react-router-dom` v7, `@tanstack/react-query`, `react-hook-form`, `zod` v4.
- **`import type`** para interfaces/tipos (regra `verbatimModuleSyntax` do tsconfig).
- **Nomes:** componentes em `PascalCase`, tudo mais em `camelCase`.
- **Idioma:** toda a UI em português.
- **Datas:** chegam da API como `string`. Formate no componente; não converta na interface.

---

## Estrutura de pastas alvo

```
src/
├── api/                    # ✅ Clientes HTTP prontos
│   ├── axiosClient.ts
│   ├── authApi.ts
│   ├── seguradosApi.ts
│   ├── apolicesApi.ts
│   └── sinistrosApi.ts
│
├── interfaces/             # ✅ Tipos TypeScript prontos
│   ├── enums.ts
│   ├── respostaPaginada.ts
│   ├── errorResponse.ts
│   ├── auth/
│   ├── segurados/
│   ├── apolices/
│   └── sinistros/
│
├── context/                # ⬜ Passo 1
│   └── AuthContext.tsx
│
├── components/
│   └── layout/             # ⬜ Passo 2
│       ├── AppLayout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
│
├── routes/                 # ⬜ Passo 2
│   ├── AppRoutes.tsx
│   └── RotaProtegida.tsx
│
├── features/               # ⬜ Passos 3-5
│   ├── segurados/
│   │   ├── hooks/useSegurados.ts
│   │   └── components/
│   ├── apolices/
│   │   ├── hooks/useApolices.ts
│   │   └── components/
│   └── sinistros/
│       ├── hooks/useSinistros.ts
│       └── components/
│
└── pages/                  # ⬜ Passos 1-6
    ├── LoginPage.tsx
    ├── DashboardPage.tsx
    ├── SeguradosListPage.tsx
    ├── ApolicesListPage.tsx
    ├── SinistrosListPage.tsx
    └── SinistroDetailPage.tsx
```

---

## Comandos do dia a dia

```bash
npm run dev      # Vite em :5173 — sem proxy, chama :8080 diretamente (atenção ao CORS)
npm run build    # tsc -b + vite build (typecheck incluído)
npm run lint     # ESLint
```

**Antes de qualquer trabalho, suba a infra:**

```bash
# Na raiz do monorepo
docker compose up -d postgres kafka

# Em cada serviço necessário (ex: auth + segurados)
cd backend/auth-service      && ./mvnw spring-boot:run
cd backend/segurados-service && ./mvnw spring-boot:run
```

Sem backend no ar, as chamadas falham com erros de rede — isso é esperado. Desenvolva com estados de erro explícitos.

---

## Passo 1 — Autenticação (pré-requisito de tudo)

O gateway rejeita toda requisição de negócio sem JWT válido. A auth vem primeiro.

### O que criar

**`src/context/AuthContext.tsx`**
```typescript
// Guarda no localStorage: token, usuarioId, papel ('ADMIN' | 'ANALISTA' | 'GESTOR')
// Expõe: login(dto), logout(), usuario, isAutenticado
// Ao montar: chama authApi.validarToken() para revalidar o token salvo
```

**`src/pages/LoginPage.tsx`**
- Formulário com `react-hook-form` + zod (campos: `login`, `senha`)
- Chama `authApi.login()` → salva token → redireciona para `/dashboard`

**`src/routes/RotaProtegida.tsx`**
- Redireciona para `/login` se não houver token
- Aceita `papeis?: PapelUsuario[]` para controle de acesso por role

### APIs disponíveis

```typescript
authApi.login({ login, senha })   // POST /auth/login → { token, tipo, expiresIn, papel }
authApi.validarToken()            // GET  /auth/validar → Usuario
authApi.buscarUsuario(id)         // GET  /auth/usuarios/{id} → Usuario
```

### Interceptor de 401 (adicionar em `axiosClient.ts`)

```typescript
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Passo 2 — Layout base + rotas

Com auth no lugar, construa o esqueleto que todas as features vão habitar.

### O que criar

**`src/components/layout/AppLayout.tsx`** — Sidebar + Header + `<Outlet />`

**`src/routes/AppRoutes.tsx`**
```typescript
// Rotas públicas:   /login
// Rotas protegidas: /dashboard, /segurados, /apolices, /sinistros, /sinistros/:id
```

**Sidebar** — visibilidade por papel:

| Rota | ANALISTA | GESTOR | ADMIN |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Segurados | ✅ | ✅ | ✅ |
| Apólices | ✅ | ✅ | ✅ |
| Sinistros | ✅ | ✅ | ✅ |

---

## Passo 3 — Hooks TanStack Query

Encapsule cada `*Api` em um hook. As páginas consomem apenas `data`, `isLoading` e `isError`.

**`src/features/segurados/hooks/useSegurados.ts`**

```typescript
export function useSegurados(filtros?: FiltrosSegurados) {
  return useQuery({
    queryKey: ['segurados', filtros],
    queryFn: () => seguradoApi.listar(filtros),
  });
}

export function useCriarSegurado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seguradoApi.criar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['segurados'] }),
  });
}
```

Repita o padrão para `useApolices` e `useSinistros`.

**`src/main.tsx`** — envolva o app:

```typescript
<QueryClientProvider client={new QueryClient()}>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
</QueryClientProvider>
```

---

## Passo 4 — Feature: Segurados

A mais simples — sem dependência de outras features. Valide aqui o padrão completo antes de replicar.

### Endpoints disponíveis

```
POST   /segurados               → criar
GET    /segurados?nome=&page=   → listar (paginado)
GET    /segurados/{id}          → buscarPorId
PUT    /segurados/{id}          → atualizar
```

> ⚠️ Não existe `/segurados/{id}/apolices`. Para listar apólices/sinistros de um segurado, faça duas chamadas no componente:
> ```typescript
> apolicesApi.listar({ seguradoId })
> sinistrosApi.listar({ seguradoId })
> ```

### Componentes a criar

| Componente | Responsabilidade |
|---|---|
| `SeguradoTable.tsx` | Lista paginada: nome, CPF/CNPJ, tipo, e-mail, ações |
| `SeguradoFilters.tsx` | Filtro por `nome`; controla `page` |
| `SeguradoForm.tsx` | Criação e edição — valida CPF/CNPJ por `tipoPessoa` e UF |
| `SeguradoDetailDrawer.tsx` | Detalhe lateral com apólices e sinistros relacionados |
| `SeguradosListPage.tsx` | Compõe filtros + tabela + drawer |

### Zod schema (exemplo)

```typescript
const schema = z.object({
  tipoPessoa: z.enum(['PF', 'PJ']),
  nomeRazaoSocial: z.string().min(3),
  cpfCnpj: z.string().refine(validarCpfCnpj, 'CPF/CNPJ inválido'),
  email: z.string().email(),
  endereco: z.object({
    uf: z.string().length(2).optional(),
    cep: z.string().regex(/^\d{8}$/).optional(),
  }).optional(),
});
```

---

## Passo 5 — Feature: Apólices

Introduz filtro por entidade relacionada (`seguradoId`) e o fluxo de PATCH de status.

### Endpoints disponíveis

```
POST   /apolices                                              → criar
GET    /apolices?status=&tipoSeguro=&seguradoId=&page=        → listar
GET    /apolices/{id}                                         → buscarPorId
PATCH  /apolices/{id}/status                                  → atualizarStatus
```

### Componentes a criar

| Componente | Responsabilidade |
|---|---|
| `ApoliceTable.tsx` | Lista com badge de status colorido |
| `ApoliceFilters.tsx` | Filtros: `status`, `tipoSeguro`, `seguradoId` |
| `ApoliceForm.tsx` | Criar apólice com lista de coberturas |
| `CoberturaList.tsx` | Editor de coberturas (add/remove) |
| `AlterarStatusModal.tsx` | Confirma PATCH de status |
| `ApoliceDetailDrawer.tsx` | Detalhe + coberturas + sinistros vinculados |

### Paleta de status de apólice

| Status | Cor |
|---|---|
| ATIVA | verde |
| SUSPENSA | amarelo |
| CANCELADA | vermelho |
| EXPIRADA | cinza |

---

## Passo 6 — Feature: Sinistros (o mais complexo)

Depende de apólices e segurados. Tem máquina de estados completa. Faça por último.

### Endpoints disponíveis

```
POST   /sinistros                           → registrar
GET    /sinistros?status=&apoliceId=&page=  → listar
GET    /sinistros/{id}                      → buscarPorId (SinistroDetalhado)
PATCH  /sinistros/{id}/atribuir             → atribuirAnalista (?analistaId=)
PATCH  /sinistros/{id}/aguardar-documentos  → aguardarDocumentos
PATCH  /sinistros/{id}/aprovar              → aprovar { valorAprovado, observacao }
PATCH  /sinistros/{id}/rejeitar             → rejeitar { motivo }
POST   /sinistros/{id}/documentos           → adicionarDocumento
GET    /sinistros/{id}/historico            → mostrarHistorico
GET    /sinistros/dashboard/resumo          → resumo para o Dashboard
```

### Máquina de estados

```
REGISTRADO
  └─→ EM_ANALISE
        ├─→ AGUARDANDO_DOCUMENTOS ─→ (volta para EM_ANALISE)
        ├─→ APROVADO ─→ PAGO
        └─→ REJEITADO
```

### Paleta de status de sinistro

| Status | Cor |
|---|---|
| REGISTRADO | azul claro |
| EM_ANALISE | azul |
| AGUARDANDO_DOCUMENTOS | amarelo |
| APROVADO | verde claro |
| REJEITADO | vermelho |
| PAGO | verde escuro |

### Componentes a criar

| Componente | Responsabilidade |
|---|---|
| `SinistroTable.tsx` | Lista com badge de status + filtros |
| `SinistroForm.tsx` | Registrar sinistro (apólice, tipo, descrição) |
| `AprovarRejeitarModal.tsx` | Formulário de aprovação (valor) ou rejeição (motivo) |
| `DocumentoUploadForm.tsx` | Adicionar documento com tipo e URL |
| `HistoricoTimeline.tsx` | Linha do tempo dos eventos do sinistro |
| `SinistroDetailPage.tsx` | Página completa: dados + documentos + histórico + ações |

---

## Passo 7 — Dashboard

Consolida as três features. Consome `GET /sinistros/dashboard/resumo`.

```typescript
// Estrutura esperada do resumo:
{
  totalSinistros: number;
  porStatus: Record<StatusSinistro, number>;
  valorTotalAprovado: number;
  sinistrosRecentes: Sinistro[];
}
```

Componentes sugeridos: `StatCard`, gráfico de pizza por status (use a paleta acima), lista de recentes.

---

## Passo 8 — Polimento

Aplique de forma consistente **em todas as telas** após todas as features estarem prontas:

- [ ] Estado `isLoading` → skeleton ou spinner centralizado
- [ ] Estado `isError` → mensagem de erro com botão de retry
- [ ] Estado vazio (`data.content.length === 0`) → ilustração + texto orientativo
- [ ] Logout automático em respostas `401` (interceptor do Passo 1)
- [ ] Acessibilidade: `aria-label` em ícones, foco visível, contraste ≥ 4.5:1
- [ ] Responsividade: sidebar colapsável em telas < 768px

---

## Ordem de implementação (resumo)

```
auth (context + login)
  → layout (AppLayout + rotas protegidas)
    → hooks TanStack Query
      → feature Segurados
        → feature Apólices
          → feature Sinistros
            → Dashboard
              → Polimento
```

Cada etapa usa apenas o que já foi construído. É a mesma lógica do backend: *do que não depende de nada → para o que depende de muito*.