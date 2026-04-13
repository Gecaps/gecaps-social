# Social Content OS — Design Spec

> **Data:** 2026-04-13
> **Status:** Aprovado
> **Base:** PRD prd_social_content_os.md + brainstorming session
> **Repo:** Gecaps/gecaps-social (evolucao do gecaps-social existente)

---

## 1. Visao Geral

Plataforma SaaS de operacao de conteudo para redes sociais, orientada por marca. Evolucao do gecaps-social existente (social.gecaps.com.br), reestruturado de forma limpa seguindo o PRD.

**O que o produto faz:** captar referencias externas → organizar por conta → transformar em ideias → gerar pecas com IA alinhadas a marca → controlar aprovacao e pipeline → publicar → acompanhar performance → reaproveitar aprendizados.

**Usuario principal no MVP:** operador de conteudo / social media, operando 1-3 contas.

---

## 2. Decisoes de Design

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Base do projeto | Evoluir gecaps-social | Infraestrutura real ja funciona (Next.js 16, Supabase, Cloudflare, Vercel) |
| Arquitetura | Modular por dominio | Cada modulo do PRD isolado, escalavel pra SaaS |
| Auth | Sem auth no MVP | 1 operador, foco nos modulos. Auth vem depois |
| Trello | Remover | Fluxo PRD (Referencias→Ideias→Pecas) substitui completamente |
| IA na producao | Gera tudo automaticamente | Apos aprovacao da ideia, IA gera peca completa. Operador revisa |
| Publicacao | Download manual no MVP | Estrutura pronta pra API do Instagram depois |
| Metricas | Manuais no MVP | Operador registra numeros. API do Instagram como evolucao futura |
| Brand Playbook | Completo + exemplos reais | Few-shot com posts reais pra consistencia de marca |
| Referencias | Extracao + resumo + tags automaticas | IA classifica e contextualiza antes de gerar ideias |

---

## 3. Stack Tecnica

| Tecnologia | Uso |
|---|---|
| Next.js 16 App Router | Framework web (React 19) |
| TypeScript 5 + Tailwind CSS 4 | Tipagem e estilo |
| shadcn/ui | Componentes UI |
| Supabase (uhmawqojswwxqnwngwth) | Banco de dados |
| Claude Sonnet 4 (@anthropic-ai/sdk) | Geracao de conteudo (4 pontos de IA) |
| Cloudflare Browser Rendering | Render HD de imagens |
| Satori / @vercel/og | Preview rapido inline |
| Readability + pdf-parse | Extracao de conteudo de referencias |
| Vercel | Hosting + deploy automatico |
| Telegram Bot API | Notificacoes (mantido) |
| Pexels API | Fotos stock (mantido) |

---

## 4. Modelo de Dados

### 4.1 accounts (renomear de social_accounts)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| name | TEXT | Nome da conta ("GECAPS Brasil") |
| handle | TEXT | "@gecapsbrasil" |
| platform | TEXT | "instagram" |
| avatar_url | TEXT | Logo da marca (novo) |
| active | BOOL | |
| created_at | TIMESTAMPTZ | |

### 4.2 brand_playbooks (novo)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | 1 por conta |
| tone_of_voice | TEXT | Tom de voz |
| style | TEXT | Estilo editorial |
| mandatory_words | TEXT[] | Palavras obrigatorias |
| forbidden_words | TEXT[] | Palavras proibidas |
| default_cta | TEXT | CTA padrao |
| do_examples | TEXT | Jeito certo de falar |
| dont_examples | TEXT | Jeito errado de falar |
| post_examples | JSONB | Posts reais como few-shot |
| extra_instructions | TEXT | Instrucoes adicionais |
| updated_at | TIMESTAMPTZ | |

### 4.3 references (novo)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | |
| type | TEXT | link, text, file, pdf |
| source_url | TEXT | URL original (se link) |
| raw_content | TEXT | Conteudo extraido |
| file_url | TEXT | URL do arquivo (se upload) |
| summary | TEXT | Resumo IA contextualizado |
| tags | TEXT[] | Tags automaticas IA |
| suggested_pilar | TEXT | Pilar sugerido pela IA |
| suggested_format | TEXT | Formato sugerido pela IA |
| relevance_score | INT | 1-10 relevancia pra marca |
| status | TEXT | novo, triado, relevante, virou_ideia, usado, descartado, arquivado |
| created_at | TIMESTAMPTZ | |
| processed_at | TIMESTAMPTZ | |

### 4.4 ideas (novo)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | |
| reference_id | UUID FK → references | null se manual |
| theme | TEXT | Tema da ideia |
| angle | TEXT | Angulo editorial |
| objective | TEXT | Objetivo do post |
| suggested_format | TEXT | estatico, carrossel, reels, story |
| justification | TEXT | Por que essa ideia |
| brand_fit | TEXT | Aderencia a marca |
| status | TEXT | pending, approved, rejected |
| is_manual | BOOL | Criada manualmente? |
| created_at | TIMESTAMPTZ | |

### 4.5 pieces (renomear de social_posts + novos campos)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | |
| idea_id | UUID FK → ideas | (novo) |
| title | TEXT | |
| hook | TEXT | |
| pilar | TEXT | educativo, autoridade, produto, conexao, social-proof, objecao |
| format | TEXT | estatico, carrossel, story, reels |
| status | TEXT | 10 status (ver maquina de estados) |
| scheduled_date | DATE | |
| scheduled_time | TEXT | |
| published_date | TIMESTAMPTZ | Data real de publicacao (novo) |
| caption | TEXT | |
| hashtags | TEXT | |
| cta | TEXT | |
| image_url | TEXT | |
| layout | TEXT | branco, verde, quote, foto |
| current_version | INT | |
| creative_brief | TEXT | Briefing criativo (novo) |
| visual_direction | TEXT | Direcao visual (novo) |
| slide_structure | JSONB | Estrutura de slides/carrossel (novo) |
| rejection_reason | TEXT | Motivo da rejeicao (novo) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 4.6 piece_versions (renomear de social_post_versions + expandir)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| piece_id | UUID FK → pieces | |
| version | INT | |
| caption | TEXT | |
| hashtags | TEXT | |
| image_url | TEXT | |
| creative_brief | TEXT | (novo) |
| visual_direction | TEXT | (novo) |
| slide_structure | JSONB | (novo) |
| change_type | TEXT | copy, visual, structure (novo) |
| feedback | TEXT | |
| created_at | TIMESTAMPTZ | |

### 4.7 metrics (novo)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| piece_id | UUID FK → pieces (unique) | 1 por peca |
| likes | INT | |
| comments | INT | |
| shares | INT | |
| saves | INT | |
| reach | INT | |
| impressions | INT | |
| engagement_rate | FLOAT | Calculado |
| source | TEXT | manual, api |
| notes | TEXT | Observacoes do operador |
| recorded_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 4.8 insights (novo)

| Campo | Tipo | Descricao |
|---|---|---|
| id | UUID PK | |
| account_id | UUID FK → accounts | |
| content | TEXT | Texto do insight |
| type | TEXT | auto, manual |
| source_pieces | UUID[] | Pecas que geraram o insight |
| is_edited | BOOL | Operador editou? |
| created_at | TIMESTAMPTZ | |

### 4.9 Relacoes

```
account  1 ←→ 1  brand_playbook
account  1 ←→ N  references
reference 1 ←→ N  ideas (5 por referencia + manuais)
idea     1 ←→ 1  piece (1 ideia aprovada = 1 peca)
piece    1 ←→ N  piece_versions
piece    1 ←→ 1  metrics
account  1 ←→ N  insights
```

---

## 5. Estrutura de Pastas

```
gecaps-social/
├── app/
│   ├── layout.tsx                  -- root layout (fonts, theme)
│   ├── page.tsx                    -- redirect → /contas
│   ├── contas/
│   │   ├── page.tsx                -- lista de contas
│   │   └── nova/page.tsx           -- criar conta
│   ├── (conta)/[accountId]/
│   │   ├── layout.tsx              -- sidebar + topbar da conta
│   │   ├── metricas/page.tsx       -- HOME: dashboard metricas
│   │   ├── calendario/page.tsx     -- calendario editorial
│   │   ├── pipeline/page.tsx       -- kanban de pecas
│   │   ├── referencias/
│   │   │   ├── page.tsx            -- biblioteca
│   │   │   └── [id]/page.tsx       -- detalhe + ideias
│   │   ├── ideias/page.tsx         -- todas as ideias
│   │   ├── pecas/
│   │   │   └── [id]/page.tsx       -- editor de peca
│   │   ├── publicados/page.tsx     -- historico publicado
│   │   ├── playbook/page.tsx       -- brand playbook
│   │   └── configuracoes/page.tsx  -- config da conta
│   └── api/
│       ├── accounts/               -- CRUD contas
│       ├── playbook/               -- CRUD playbook
│       ├── references/             -- CRUD + processamento
│       ├── ideas/                  -- geracao + CRUD
│       ├── pieces/                 -- CRUD + aprovacao
│       ├── metrics/                -- CRUD metricas
│       ├── insights/               -- geracao + CRUD
│       ├── ai/
│       │   ├── process-reference/  -- extrai + resume + tags
│       │   ├── generate-ideas/     -- 5 ideias por referencia
│       │   ├── generate-piece/     -- peca completa
│       │   ├── generate-caption/   -- legenda isolada
│       │   └── generate-insights/  -- insights por metricas
│       ├── render/                 -- Cloudflare HD (mantido)
│       ├── preview/                -- Satori preview (mantido)
│       └── upload/                 -- upload de arquivos
├── modules/
│   ├── accounts/
│   │   ├── types.ts
│   │   ├── queries.ts
│   │   └── actions.ts
│   ├── playbook/
│   │   ├── types.ts
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── prompt-builder.ts       -- monta prompt da IA
│   ├── references/
│   │   ├── types.ts
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── extractor.ts            -- scraping + PDF parse
│   ├── ideas/
│   │   ├── types.ts
│   │   ├── queries.ts
│   │   └── actions.ts
│   ├── pieces/
│   │   ├── types.ts
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── status-machine.ts       -- transicoes validas
│   ├── metrics/
│   │   ├── types.ts
│   │   ├── queries.ts
│   │   └── ranking.ts
│   ├── insights/
│   │   ├── types.ts
│   │   └── queries.ts
│   └── ai/
│       ├── client.ts               -- Claude SDK wrapper
│       ├── prompts/
│       │   ├── reference.ts
│       │   ├── ideas.ts
│       │   ├── piece.ts
│       │   └── insights.ts
│       └── pipeline.ts             -- orquestrador IA
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── account-switcher.tsx
│   ├── references/
│   │   ├── reference-list.tsx
│   │   ├── reference-card.tsx
│   │   ├── add-reference-modal.tsx
│   │   └── reference-detail.tsx
│   ├── ideas/
│   │   ├── idea-list.tsx
│   │   ├── idea-card.tsx
│   │   └── create-idea-modal.tsx
│   ├── pieces/
│   │   ├── piece-editor.tsx
│   │   ├── layout-selector.tsx
│   │   ├── approval-actions.tsx
│   │   └── version-history.tsx
│   ├── pipeline/
│   │   ├── pipeline-board.tsx
│   │   └── pipeline-card.tsx
│   ├── calendar/
│   │   ├── calendar-view.tsx
│   │   ├── week-view.tsx
│   │   └── month-view.tsx
│   ├── metrics/
│   │   ├── metrics-dashboard.tsx
│   │   ├── ranking-list.tsx
│   │   ├── insights-panel.tsx
│   │   └── metric-input.tsx
│   ├── playbook/
│   │   └── playbook-form.tsx
│   └── ui/                         -- shadcn components
├── lib/
│   ├── supabase.ts                 -- client (mantido)
│   ├── cloudflare-render.ts        -- render HD (mantido)
│   ├── telegram.ts                 -- notificacoes (mantido)
│   ├── pexels.ts                   -- fotos stock (mantido)
│   └── utils.ts                    -- cn() etc (mantido)
└── templates/                      -- HTML templates (mantido)
    ├── post-final-branco.html
    ├── post-final-verde.html
    ├── post-quote.html
    └── post-foto-premium.html
```

---

## 6. Navegacao

### Tela inicial
`/contas` — Lista de contas com card pra cada marca + botao "Nova conta"

### Dentro da conta
`/[accountId]/metricas` — Home (dashboard de metricas)

### Sidebar (ordem do PRD)
1. Metricas (home)
2. Calendario
3. Pipeline
4. ---
5. Referencias
6. Ideias
7. ---
8. Publicados
9. ---
10. Playbook
11. Configuracoes

---

## 7. Pipeline de IA

### 7.1 Prompt Builder (modules/playbook/prompt-builder.ts)

Toda chamada de IA passa pelo prompt builder. Monta o system prompt dinamicamente a partir do Brand Playbook da conta:
- Tom de voz, estilo, palavras obrigatorias/proibidas
- CTA padrao, exemplos certo/errado
- Posts reais como few-shot (com metricas se disponiveis)
- Instrucoes extras

### 7.2 Quatro pontos de IA

| # | Acao | Trigger | Input | Output |
|---|------|---------|-------|--------|
| 1 | Processar Referencia | Operador adiciona referencia | Conteudo bruto + Playbook | Resumo contextualizado, tags, pilar, formato, score relevancia |
| 2 | Gerar 5 Ideias | Automatico apos processar referencia | Referencia processada + Playbook + ideias existentes | 5 ideas (tema, angulo, objetivo, formato, justificativa, brand_fit) |
| 3 | Gerar Peca Completa | Operador aprova ideia | Ideia + referencia original + Playbook + posts de melhor performance | Titulo, hook, caption, hashtags, CTA, briefing criativo, direcao visual, slides, layout |
| 4 | Gerar Insights | Operador registra metricas / manual | Metricas + historico + Playbook | Padroes, o que funciona/nao funciona, sugestoes, recomendacoes |

### 7.3 Extracao de referencias
- Links: Fetch + @mozilla/readability (extrai texto limpo de paginas web)
- PDFs: pdf-parse (extrai texto de PDF)
- Texto manual: direto
- Upload de arquivo: Supabase Storage + extracao conforme tipo

---

## 8. Maquina de Estados

### Fluxo principal
```
reference → idea → idea_approved → in_production → final_approved → scheduled → published
```

### Estados laterais
- `rejected` — vai automaticamente pra `in_adjustment`
- `in_adjustment` — operador corrige → volta pra `in_production`
- `paused` — de qualquer status, retoma pro anterior

### Transicoes validas (status-machine.ts)
```
reference     → idea                 (IA processa)
idea          → idea_approved        (operador aprova)
idea          → rejected             (operador rejeita)
idea_approved → in_production        (IA gera peca)
in_production → final_approved       (operador aprova)
in_production → rejected             (operador rejeita)
final_approved → scheduled           (operador agenda)
scheduled     → published            (operador publica)
rejected      → in_adjustment        (automatico)
in_adjustment → in_production        (operador reenvia)
qualquer      → paused               (operador pausa)
paused        → {status anterior}    (operador retoma)
```

---

## 9. Migracao de Dados Existentes

Uma unica migration SQL no Supabase:

### Renomear tabelas
- `social_accounts` → `accounts` (adicionar campo `avatar_url`)
- `social_posts` → `pieces` (adicionar campos novos, migrar status, remover campos Trello)
- `social_post_versions` → `piece_versions` (adicionar campos novos)

### Migrar status
- `pending` → `in_production`
- `approved` → `final_approved`
- `rejected` → `rejected`
- `published` → `published`

### Remover
- `social_editorial_lines` (substituida pelo Brand Playbook)
- Campos Trello de pieces (`trello_card_id`, `trello_list_name`)

### Criar tabelas novas
- `brand_playbooks`
- `references`
- `ideas`
- `metrics`
- `insights`

Os ~20 posts existentes sao preservados como pecas com status migrado. Nenhum dado e perdido.

---

## 10. O que se mantem do codigo atual

| Componente | Status |
|---|---|
| lib/supabase.ts | Mantido |
| lib/cloudflare-render.ts | Mantido |
| lib/telegram.ts | Mantido |
| lib/pexels.ts | Mantido |
| lib/utils.ts | Mantido |
| templates/*.html | Mantidos (4 templates de imagem) |
| API /api/render | Mantido |
| API /api/preview | Mantido |
| Componentes de calendario | Refatorados pra nova estrutura |
| Editor de peca (post-detail) | Refatorado pra nova estrutura |
| Sentry monitoring | Mantido |

### Remover
| Componente | Motivo |
|---|---|
| lib/trello.ts | Trello removido |
| lib/claude.ts | Substituido por modules/ai/ |
| lib/html-renderer.ts | Legado nao usado |
| lib/image-generator.ts | Legado nao usado |
| lib/types.ts | Substituido por modules/*/types.ts |
| app/api/trello/ | Trello removido |
| app/api/posts/ | Substituido por app/api/pieces/ |
| app/api/cron/ | Trello-dependent, remover |
| puppeteer-core, @sparticuz/chromium | Deps legadas nao usadas |
| sharp | Dep legada nao usada |

---

## 11. Fases de Implementacao (roadmap do PRD)

### Fase 1 — Fundamentos
- Migracao do banco (renomear tabelas, criar novas)
- Reestruturar pastas (app/, modules/, components/)
- Modulo Conta (lista + CRUD)
- Brand Playbook (formulario completo + prompt builder)

### Fase 2 — Curadoria Editorial
- Modulo Referencias (biblioteca + extracao + processamento IA)
- Modulo Ideias (geracao automatica + criacao manual + aprovacao)

### Fase 3 — Producao
- Geracao de peca completa via IA
- Editor de peca (refatorar post-detail existente)
- Aprovacao final
- Versionamento completo

### Fase 4 — Operacao
- Pipeline (kanban com 10 status)
- Calendario (refatorar existente + novos campos)
- Status machine

### Fase 5 — Saida
- Publicacao manual assistida (download HD + marcar como publicado)
- Registro de data real de publicacao

### Fase 6 — Feedback
- Metricas manuais (formulario por peca publicada)
- Ranking de conteudos
- Insights automaticos + editaveis
- Historico de pecas publicadas com reaproveitamento
