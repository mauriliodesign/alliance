# Base de dados — SaaS multi-tenant (Supabase / Postgres)

`0001_init.sql` cria o schema multi-tenant que isola os dados por **academia**
(`organization`) usando Row-Level Security (RLS).

## O que o schema cria
- **Tenancy:** `organizations` (academia), `profiles` (espelho de `auth.users`),
  `memberships` (user ↔ org, com role `owner | admin | staff`).
- **CRM (por `org_id`):** `leads`, `followups`, `tasks` (calendário), `lead_activity`
  (timeline), `lead_insights` (cache da IA).
- **RLS** em todas as tabelas — só membros da org veem/escrevem os seus dados.
- **Funções:**
  - `create_organization(nome, slug)` — cria a academia e torna o autenticado `owner`.
  - `submit_lead(slug, nome, email, phone, instagram, tags)` — captura pública do
    formulário (role anónima), sem expor a BD.
  - `get_org_public(slug)` — dados públicos da academia para o site de marketing.
  - `is_org_member()` / `has_org_role()` — helpers usados pelas policies.

## Como aplicar

### Opção A — Supabase (recomendado)
1. Cria um projeto em https://supabase.com.
2. SQL Editor → cola o conteúdo de `0001_init.sql` → **Run**.
   (ou, com a CLI: coloca o ficheiro em `supabase/migrations/` e corre `supabase db push`.)

### Opção B — Postgres simples (Neon/Vercel Postgres)
O schema é maioritariamente standard, mas a parte de auth assume o Supabase
(`auth.users`, `auth.uid()`). Para Postgres puro, substitui:
- `references auth.users(id)` por a tua tabela de utilizadores;
- `auth.uid()` (nas funções/policies) pela tua forma de obter o user da sessão (ex.:
  `current_setting('app.user_id')::uuid`);
- remove o trigger `trg_on_auth_user_created` (cria o `profile` na tua app).

## Variáveis de ambiente (passo seguinte, ao ligar a app)
- **Cliente (Vite):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ORG_SLUG`.
- **Servidor (Vercel functions):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `GEMINI_API_KEY`.

## Onboarding de uma academia
```sql
-- (autenticado como o futuro dono)
select create_organization('Alliance Jiu Jitsu Lisboa', 'alliance-lisboa');
-- adicionar staff: inserir em memberships (owner/admin podem fazê-lo via RLS)
```

## Captura pública de um lead (formulário do site)
```sql
select submit_lead('alliance-lisboa', 'João Pereira', 'joao@email.com', '+351912345678', null, '{adultos}');
```

## Testar o isolamento (RLS)
```sql
-- Com a sessão do user A (membro da org A) só deve devolver leads da org A:
select count(*) from leads;            -- conta apenas a org do user atual
-- Tentar ler a org B devolve 0 linhas (a RLS filtra), não um erro.
```

> Nota: a chave do Gemini é segredo **de plataforma** (env var no servidor), não fica na BD.
> O modelo, o on/off da IA e as tags/etapas ficam por academia na linha `organizations`.
