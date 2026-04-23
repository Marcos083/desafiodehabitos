@AGENTS.md

# Habit Partner App — Contexto para Claude Code

> Next.js 16 tem breaking changes. **Sempre** consulte `node_modules/next/dist/docs/` antes de escrever código Next novo (conforme `AGENTS.md`).

## Visão Geral
App web de accountability de hábitos entre parceiros (início: 1:1). PWA mobile-first. Substitui sistema de hábitos no Notion entre Marcos e Nicolas.

Blueprint mestre vive no Notion. Este arquivo é a fonte-de-verdade curta para cada sessão.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Zustand (estado local) + TanStack Query (estado servidor)
- Supabase (Postgres + Auth + Realtime + Storage) via `@supabase/ssr`
- Zod (validação runtime) + React Hook Form
- GSAP (micro-animações pontuais)
- Deploy: Vercel + Supabase cloud

## Convenções de Código

### Geral
- TypeScript strict mode. Sem `any`.
- Prefira Server Components. Client Components apenas com `"use client"` quando realmente precisar (interatividade, hooks).
- Funções pequenas, nomeadas, focadas em 1 responsabilidade.
- Imports absolutos via `@/` (configurado no tsconfig).
- Zero `console.log` em código commitado.

### Estrutura (feature-based)
- Tudo de uma feature fica em `src/features/<feature>/` — components/hooks/queries/mutations/types juntos.
- UI primitives do shadcn em `src/components/ui/`.
- Componentes compartilhados em `src/components/shared/`.
- Hooks globais em `src/hooks/`. Hooks específicos de feature ficam dentro da feature.
- Rotas por área: `src/app/(auth)/` para auth, `src/app/(app)/` para área logada.

### Supabase
- Cliente browser: `src/lib/supabase/client.ts`
- Cliente server (RSC/actions): `src/lib/supabase/server.ts`
- Middleware de refresh de sessão: `src/lib/supabase/middleware.ts`
- **Nunca** usar `service_role` key no frontend.
- **Sempre** regenerar types após mudar schema: `npx supabase gen types typescript --project-id vqxnjtgnaafjhdpquiiy > src/types/database.types.ts`
- RLS **obrigatório** em TODAS as tabelas desde o primeiro commit. Sem exceção.

### Styling
- Tailwind utility-first. Sem CSS customizado solto.
- Usar `cn()` (`src/lib/utils.ts`) para class merging condicional.
- Mobile-first sempre — começar mobile, só então breakpoints desktop.
- Dark mode fica pra depois do MVP.

### Forms
- React Hook Form + Zod (`zodResolver`).
- Schema de validação colocado junto do form.

## Don'ts (regras rígidas)
- NÃO usar Prisma. Supabase client direto.
- NÃO usar Redux. Zustand resolve.
- NÃO fazer fetch direto pro Supabase. Usar SDK.
- NÃO criar CSS global além do `globals.css` base. Tudo Tailwind.
- NÃO colocar lógica de negócio em componentes. Extrair pra hooks/utils.
- NÃO commitar código que não passa no type-check.
- NÃO fazer commits gigantes. Um commit = uma mudança lógica.

## Comandos Frequentes
```
npm run dev           # inicia dev server
npm run type-check    # tsc --noEmit
npm run lint          # eslint
npm run lint:fix      # eslint --fix
npm run format        # prettier --write
npm run build         # build de produção
```

Supabase CLI:
```
# Regenerar types (dev)
npx supabase gen types typescript --project-id vqxnjtgnaafjhdpquiiy > src/types/database.types.ts
# Regenerar types (prod)
npx supabase gen types typescript --project-id wcttksbuybnitbojiodr > src/types/database.types.ts
```

## Projetos Supabase
- **Dev** — ref: `vqxnjtgnaafjhdpquiiy` | URL: `https://vqxnjtgnaafjhdpquiiy.supabase.co`
- **Prod** — ref: `wcttksbuybnitbojiodr` | URL: `https://wcttksbuybnitbojiodr.supabase.co`

## Deploy (Vercel)
- Projeto: `habitos-app` (conta `marcoscosta0920-3188s-projects`)
- Alias prod: `https://habitos-app-alpha.vercel.app`
- Push em `main` → deploy prod automático; push em `develop` → preview automático

## Padrão de Commits (Conventional Commits)
- `feat:` nova feature
- `fix:` bugfix
- `refactor:` mudança de código sem mudar comportamento
- `chore:` manutenção (deps, config)
- `docs:` só documentação
- `style:` formatação, sem mudar lógica

Branches: `main` (prod), `develop` (staging), `feature/*` (trabalho → PR pra `develop`).

## Escopo MVP (2-3 semanas)
Auth magic link → parceria 1:1 por código → CRUD de hábitos → check-in 1 toque → dashboard "Hoje" → placar semanal → realtime de check-ins do parceiro.

Critério de corte: se não for usado toda semana pelos dois usuários, fica pra fase 2+.

## Workflow com Claude Code
1. Briefe requisitos e edge cases antes de iniciar feature.
2. Implementar em passos pequenos, validar cada um antes do próximo.
3. Commits atômicos, Conventional Commits.
4. Refatoração no final da feature, não durante.
5. Atualizar este arquivo quando decisões arquiteturais mudarem.
