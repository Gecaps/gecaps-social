# Social Content OS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar o gecaps-social existente no Social Content OS definido na spec, com arquitetura modular por dominio, pipeline de IA em 4 pontos, e maquina de estados completa.

**Architecture:** Modular por dominio — cada modulo do PRD (accounts, playbook, references, ideas, pieces, metrics, insights, ai) isolado em `modules/` com types, queries e actions. Pages em `app/(conta)/[accountId]/`, APIs em `app/api/`. Supabase como banco, Claude Sonnet 4 como IA, Cloudflare Browser Rendering para imagens HD.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase (uhmawqojswwxqnwngwth), Claude Sonnet 4 (@anthropic-ai/sdk), Cloudflare Browser Rendering, Satori (@vercel/og), Telegram Bot API, Pexels API.

---

## File Map

### Files to CREATE (new)

```
modules/
  accounts/types.ts          — Account type + PieceStatus/PieceFormat/PiecePilar enums
  accounts/queries.ts        — Supabase queries: list, getById, create, update
  accounts/actions.ts        — Server Actions: createAccount, updateAccount
  playbook/types.ts          — BrandPlaybook type
  playbook/queries.ts        — getByAccountId, upsert
  playbook/actions.ts        — Server Action: savePlaybook
  playbook/prompt-builder.ts — buildSystemPrompt(playbook): string
  references/types.ts        — Reference type + ReferenceType enum
  references/queries.ts      — list, getById, create, updateProcessed
  references/actions.ts      — Server Actions: addReference, deleteReference
  references/extractor.ts    — extractContent(type, source): raw text
  ideas/types.ts             — Idea type + IdeaStatus enum
  ideas/queries.ts           — list, getById, create, updateStatus, listByReference
  ideas/actions.ts           — Server Actions: approveIdea, rejectIdea, createManualIdea
  pieces/types.ts            — Piece type + PieceVersion type
  pieces/queries.ts          — list, getById, create, update, listVersions, createVersion
  pieces/actions.ts          — Server Actions: transitionStatus, savePiece
  pieces/status-machine.ts   — VALID_TRANSITIONS map + canTransition + transition functions
  metrics/types.ts           — Metrics type
  metrics/queries.ts         — getByPieceId, upsert, listByAccount
  metrics/ranking.ts         — rankPieces(metrics[]): sorted by engagement
  insights/types.ts          — Insight type
  insights/queries.ts        — list, create, update
  ai/client.ts               — Claude SDK singleton wrapper
  ai/prompts/reference.ts    — buildReferencePrompt(raw, playbook)
  ai/prompts/ideas.ts        — buildIdeasPrompt(reference, playbook, existing)
  ai/prompts/piece.ts        — buildPiecePrompt(idea, reference, playbook, topPosts)
  ai/prompts/insights.ts     — buildInsightsPrompt(metrics, playbook)
  ai/pipeline.ts             — processReference, generateIdeas, generatePiece, generateInsights

app/
  contas/page.tsx                          — Lista de contas
  contas/nova/page.tsx                     — Criar conta
  (conta)/[accountId]/layout.tsx           — Sidebar + topbar da conta
  (conta)/[accountId]/metricas/page.tsx    — Dashboard metricas (home)
  (conta)/[accountId]/calendario/page.tsx  — Calendario editorial
  (conta)/[accountId]/pipeline/page.tsx    — Kanban de pecas
  (conta)/[accountId]/referencias/page.tsx — Biblioteca de referencias
  (conta)/[accountId]/referencias/[id]/page.tsx — Detalhe referencia + ideias
  (conta)/[accountId]/ideias/page.tsx      — Todas as ideias
  (conta)/[accountId]/pecas/[id]/page.tsx  — Editor de peca
  (conta)/[accountId]/publicados/page.tsx  — Historico publicado
  (conta)/[accountId]/playbook/page.tsx    — Brand playbook
  (conta)/[accountId]/configuracoes/page.tsx — Config da conta
  api/accounts/route.ts                    — GET list, POST create
  api/accounts/[id]/route.ts               — GET, PATCH, DELETE
  api/playbook/route.ts                    — GET, PUT (by account_id query param)
  api/references/route.ts                  — GET list, POST create
  api/references/[id]/route.ts             — GET, DELETE
  api/ideas/route.ts                       — GET list, POST create manual
  api/ideas/[id]/route.ts                  — PATCH (approve/reject)
  api/pieces/route.ts                      — GET list, POST create
  api/pieces/[id]/route.ts                 — GET, PATCH (save fields + transition)
  api/pieces/[id]/versions/route.ts        — GET versions, POST new version
  api/metrics/route.ts                     — GET list, POST/PUT upsert
  api/insights/route.ts                    — GET list, POST generate
  api/insights/[id]/route.ts               — PATCH (edit)
  api/ai/process-reference/route.ts        — POST: extract + summarize + tag
  api/ai/generate-ideas/route.ts           — POST: 5 ideas from reference
  api/ai/generate-piece/route.ts           — POST: full piece from idea
  api/ai/generate-caption/route.ts         — POST: caption only (keep existing)
  api/ai/generate-insights/route.ts        — POST: insights from metrics
  api/upload/route.ts                      — POST: file upload to Supabase Storage

components/
  layout/sidebar.tsx           — Sidebar (rewrite for [accountId] routes)
  layout/topbar.tsx            — Topbar (rewrite for account context)
  layout/mobile-nav.tsx        — Mobile nav (rewrite for [accountId] routes)
  layout/account-switcher.tsx  — Account switcher (keep, minor adapt)
  references/reference-list.tsx    — List with filters
  references/reference-card.tsx    — Card with status, score, tags
  references/add-reference-modal.tsx — Modal: link/text/file input
  references/reference-detail.tsx  — Detail view with ideas
  ideas/idea-list.tsx          — List with approve/reject actions
  ideas/idea-card.tsx          — Card with theme, angle, format
  ideas/create-idea-modal.tsx  — Manual idea creation
  pieces/piece-editor.tsx      — Full editor (evolve from post-detail)
  pieces/approval-actions.tsx  — Approve/reject/adjust buttons
  pieces/version-history.tsx   — Version timeline
  pipeline/pipeline-board.tsx  — Kanban board (10 columns)
  pipeline/pipeline-card.tsx   — Draggable card
  calendar/calendar-view.tsx   — Calendar (evolve existing)
  calendar/week-view.tsx       — Week view (evolve existing)
  calendar/month-view.tsx      — Month view (evolve existing)
  metrics/metrics-dashboard.tsx — Dashboard com KPIs
  metrics/ranking-list.tsx     — Ranking de pecas
  metrics/insights-panel.tsx   — Painel de insights
  metrics/metric-input.tsx     — Formulario de metricas
  playbook/playbook-form.tsx   — Formulario completo do playbook
```

### Files to MODIFY (existing)

```
app/layout.tsx           — Remove Sidebar/Topbar/BottomNav (move to (conta) layout)
app/page.tsx             — Change redirect from /calendario to /contas
lib/supabase.ts          — Keep as-is
lib/cloudflare-render.ts — Keep as-is
lib/telegram.ts          — Keep as-is
lib/pexels.ts            — Keep as-is
lib/utils.ts             — Keep as-is
app/api/render/route.ts  — Keep as-is
app/api/preview/route.tsx — Keep as-is
```

### Files to DELETE (after migration)

```
lib/types.ts             — Replaced by modules/*/types.ts
lib/claude.ts            — Replaced by modules/ai/client.ts + prompts
lib/trello.ts            — Trello removed
lib/html-renderer.ts     — Legacy unused
lib/image-generator.ts   — Legacy unused
app/api/trello/           — Trello removed
app/api/posts/            — Replaced by api/pieces/
app/api/cron/             — Trello-dependent
app/dashboard/            — Replaced by (conta)/[accountId]/metricas/
app/calendario/           — Replaced by (conta)/[accountId]/calendario/
app/configuracoes/        — Replaced by (conta)/[accountId]/configuracoes/
app/post/                 — Replaced by (conta)/[accountId]/pecas/
components/post/          — Replaced by components/pieces/
components/dashboard/     — Replaced by components/metrics/
```

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/001_social_content_os.sql` (reference only — will be applied via Supabase MCP)

- [ ] **Step 1: Check current tables in Supabase**

Run via Supabase MCP `execute_sql`:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Verify that `social_accounts`, `social_posts`, `social_post_versions`, `social_editorial_lines` exist.

- [ ] **Step 2: Write the migration SQL**

Create `supabase/migrations/001_social_content_os.sql` with this content:

```sql
-- =============================================
-- Social Content OS Migration
-- Renames existing tables, adds new columns, creates new tables
-- =============================================

-- 1. Rename existing tables
ALTER TABLE social_accounts RENAME TO accounts;
ALTER TABLE social_posts RENAME TO pieces;
ALTER TABLE social_post_versions RENAME TO piece_versions;

-- 2. accounts: add avatar_url
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. pieces: add new columns
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS idea_id UUID;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS published_date TIMESTAMPTZ;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS creative_brief TEXT;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS visual_direction TEXT;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS slide_structure JSONB;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. pieces: migrate status values
UPDATE pieces SET status = 'in_production' WHERE status = 'pending';
UPDATE pieces SET status = 'final_approved' WHERE status = 'approved';
-- 'rejected' and 'published' stay the same

-- 5. pieces: drop Trello columns
ALTER TABLE pieces DROP COLUMN IF EXISTS trello_card_id;
ALTER TABLE pieces DROP COLUMN IF EXISTS trello_list_name;

-- 6. piece_versions: add new columns
ALTER TABLE piece_versions ADD COLUMN IF NOT EXISTS creative_brief TEXT;
ALTER TABLE piece_versions ADD COLUMN IF NOT EXISTS visual_direction TEXT;
ALTER TABLE piece_versions ADD COLUMN IF NOT EXISTS slide_structure JSONB;
ALTER TABLE piece_versions ADD COLUMN IF NOT EXISTS change_type TEXT;

-- 7. piece_versions: rename post_id to piece_id
ALTER TABLE piece_versions RENAME COLUMN post_id TO piece_id;

-- 8. Drop editorial lines (replaced by brand playbook)
DROP TABLE IF EXISTS social_editorial_lines;

-- 9. Create brand_playbooks
CREATE TABLE brand_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  tone_of_voice TEXT,
  style TEXT,
  mandatory_words TEXT[] DEFAULT '{}',
  forbidden_words TEXT[] DEFAULT '{}',
  default_cta TEXT,
  do_examples TEXT,
  dont_examples TEXT,
  post_examples JSONB DEFAULT '[]',
  extra_instructions TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Create references
CREATE TABLE references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'text', 'file', 'pdf')),
  source_url TEXT,
  raw_content TEXT,
  file_url TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  suggested_pilar TEXT,
  suggested_format TEXT,
  relevance_score INT CHECK (relevance_score BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'triado', 'relevante', 'virou_ideia', 'usado', 'descartado', 'arquivado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 11. Create ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  reference_id UUID REFERENCES references(id) ON DELETE SET NULL,
  theme TEXT NOT NULL,
  angle TEXT,
  objective TEXT,
  suggested_format TEXT CHECK (suggested_format IN ('estatico', 'carrossel', 'reels', 'story')),
  justification TEXT,
  brand_fit TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Add FK from pieces to ideas
ALTER TABLE pieces ADD CONSTRAINT pieces_idea_id_fkey 
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL;

-- 13. Create metrics
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id UUID NOT NULL REFERENCES pieces(id) ON DELETE CASCADE UNIQUE,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'api')),
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Create insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'auto' CHECK (type IN ('auto', 'manual')),
  source_pieces UUID[] DEFAULT '{}',
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Create indexes
CREATE INDEX idx_pieces_account_id ON pieces(account_id);
CREATE INDEX idx_pieces_status ON pieces(status);
CREATE INDEX idx_pieces_scheduled_date ON pieces(scheduled_date);
CREATE INDEX idx_references_account_id ON references(account_id);
CREATE INDEX idx_references_status ON references(status);
CREATE INDEX idx_ideas_account_id ON ideas(account_id);
CREATE INDEX idx_ideas_reference_id ON ideas(reference_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_metrics_piece_id ON metrics(piece_id);
CREATE INDEX idx_insights_account_id ON insights(account_id);

-- 16. Enable RLS (disabled for MVP — single operator)
-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE brand_playbooks ENABLE ROW LEVEL SECURITY;
-- etc.
```

- [ ] **Step 3: Apply the migration via Supabase MCP**

Use `apply_migration` on project `uhmawqojswwxqnwngwth` with the SQL above. Name: `social_content_os`.

- [ ] **Step 4: Verify migration succeeded**

Run via Supabase MCP `execute_sql`:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected: `accounts`, `brand_playbooks`, `ideas`, `insights`, `metrics`, `piece_versions`, `pieces`, `references` (plus any Supabase system tables).

- [ ] **Step 5: Verify existing data was preserved**

```sql
SELECT id, title, status FROM pieces LIMIT 5;
```

Expected: ~20 rows with status migrated (`in_production`, `final_approved`, `rejected`, `published`).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/001_social_content_os.sql
git commit -m "db: migrate schema to Social Content OS

- Rename social_accounts → accounts, social_posts → pieces, social_post_versions → piece_versions
- Add new columns (idea_id, creative_brief, visual_direction, slide_structure, etc)
- Migrate status values (pending→in_production, approved→final_approved)
- Drop Trello columns and social_editorial_lines
- Create new tables: brand_playbooks, references, ideas, metrics, insights
- Add indexes for common queries"
```

---

## Task 2: Module Types

**Files:**
- Create: `modules/accounts/types.ts`
- Create: `modules/playbook/types.ts`
- Create: `modules/references/types.ts`
- Create: `modules/ideas/types.ts`
- Create: `modules/pieces/types.ts`
- Create: `modules/metrics/types.ts`
- Create: `modules/insights/types.ts`

- [ ] **Step 1: Create modules/accounts/types.ts**

```typescript
export type PiecePilar =
  | "educativo"
  | "autoridade"
  | "produto"
  | "conexao"
  | "social-proof"
  | "objecao";

export type PieceFormat = "estatico" | "carrossel" | "story" | "reels";

export type PieceLayout = "branco" | "verde" | "quote" | "foto";

export type PieceStatus =
  | "reference"
  | "idea"
  | "idea_approved"
  | "in_production"
  | "final_approved"
  | "scheduled"
  | "published"
  | "rejected"
  | "in_adjustment"
  | "paused";

export interface Account {
  id: string;
  name: string;
  handle: string;
  platform: string;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
}

export const PILAR_LABELS: Record<PiecePilar, string> = {
  educativo: "Educativo",
  autoridade: "Autoridade",
  produto: "Produto",
  conexao: "Conexao",
  "social-proof": "Social Proof",
  objecao: "Objecao",
};

export const PILAR_COLORS: Record<PiecePilar, string> = {
  educativo: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
  autoridade: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  produto: "bg-neon-pink/10 text-neon-pink border-neon-pink/20",
  conexao: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "social-proof": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  objecao: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export const STATUS_LABELS: Record<PieceStatus, string> = {
  reference: "Referencia",
  idea: "Ideia",
  idea_approved: "Ideia Aprovada",
  in_production: "Em Producao",
  final_approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado",
  rejected: "Rejeitado",
  in_adjustment: "Em Ajuste",
  paused: "Pausado",
};

export const STATUS_COLORS: Record<PieceStatus, string> = {
  reference: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  idea: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  idea_approved: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  in_production: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  final_approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  published: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  in_adjustment: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  paused: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export const LAYOUT_LABELS: Record<PieceLayout, string> = {
  branco: "Branco",
  verde: "Verde",
  quote: "Quote",
  foto: "Foto",
};

export const LAYOUT_DESCRIPTIONS: Record<PieceLayout, string> = {
  branco: "Fundo claro, acentos verdes. Clean e profissional.",
  verde: "Gradiente verde escuro. Bold e impactante.",
  quote: "Fundo escuro luxo, moldura dourada. Para frases.",
  foto: "Foto premium com overlay verde. Conteudo na parte inferior.",
};
```

- [ ] **Step 2: Create modules/playbook/types.ts**

```typescript
export interface PostExample {
  caption: string;
  hashtags: string;
  pilar: string;
  format: string;
  engagement_rate?: number;
  notes?: string;
}

export interface BrandPlaybook {
  id: string;
  account_id: string;
  tone_of_voice: string | null;
  style: string | null;
  mandatory_words: string[];
  forbidden_words: string[];
  default_cta: string | null;
  do_examples: string | null;
  dont_examples: string | null;
  post_examples: PostExample[];
  extra_instructions: string | null;
  updated_at: string;
}
```

- [ ] **Step 3: Create modules/references/types.ts**

```typescript
export type ReferenceType = "link" | "text" | "file" | "pdf";

export type ReferenceStatus =
  | "novo"
  | "triado"
  | "relevante"
  | "virou_ideia"
  | "usado"
  | "descartado"
  | "arquivado";

export interface Reference {
  id: string;
  account_id: string;
  type: ReferenceType;
  source_url: string | null;
  raw_content: string | null;
  file_url: string | null;
  summary: string | null;
  tags: string[];
  suggested_pilar: string | null;
  suggested_format: string | null;
  relevance_score: number | null;
  status: ReferenceStatus;
  created_at: string;
  processed_at: string | null;
}
```

- [ ] **Step 4: Create modules/ideas/types.ts**

```typescript
export type IdeaStatus = "pending" | "approved" | "rejected";

export interface Idea {
  id: string;
  account_id: string;
  reference_id: string | null;
  theme: string;
  angle: string | null;
  objective: string | null;
  suggested_format: string | null;
  justification: string | null;
  brand_fit: string | null;
  status: IdeaStatus;
  is_manual: boolean;
  created_at: string;
}
```

- [ ] **Step 5: Create modules/pieces/types.ts**

```typescript
import type { PiecePilar, PieceFormat, PieceStatus, PieceLayout } from "@/modules/accounts/types";

export interface Piece {
  id: string;
  account_id: string;
  idea_id: string | null;
  title: string;
  hook: string | null;
  pilar: PiecePilar;
  format: PieceFormat;
  status: PieceStatus;
  scheduled_date: string | null;
  scheduled_time: string | null;
  published_date: string | null;
  caption: string | null;
  hashtags: string | null;
  cta: string | null;
  image_url: string | null;
  layout: PieceLayout;
  current_version: number;
  creative_brief: string | null;
  visual_direction: string | null;
  slide_structure: Record<string, unknown>[] | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PieceVersion {
  id: string;
  piece_id: string;
  version: number;
  caption: string | null;
  hashtags: string | null;
  image_url: string | null;
  creative_brief: string | null;
  visual_direction: string | null;
  slide_structure: Record<string, unknown>[] | null;
  change_type: string | null;
  feedback: string | null;
  created_at: string;
}
```

- [ ] **Step 6: Create modules/metrics/types.ts**

```typescript
export interface Metrics {
  id: string;
  piece_id: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  source: "manual" | "api";
  notes: string | null;
  recorded_at: string;
  updated_at: string;
}
```

- [ ] **Step 7: Create modules/insights/types.ts**

```typescript
export interface Insight {
  id: string;
  account_id: string;
  content: string;
  type: "auto" | "manual";
  source_pieces: string[];
  is_edited: boolean;
  created_at: string;
}
```

- [ ] **Step 8: Commit**

```bash
git add modules/
git commit -m "feat: add domain module types for all 7 modules

- accounts/types.ts: Account, PieceStatus (10 states), PiecePilar, PieceFormat, PieceLayout + label/color maps
- playbook/types.ts: BrandPlaybook, PostExample
- references/types.ts: Reference, ReferenceType, ReferenceStatus
- ideas/types.ts: Idea, IdeaStatus
- pieces/types.ts: Piece, PieceVersion
- metrics/types.ts: Metrics
- insights/types.ts: Insight"
```

---

## Task 3: Accounts Module (queries + actions + API)

**Files:**
- Create: `modules/accounts/queries.ts`
- Create: `modules/accounts/actions.ts`
- Create: `app/api/accounts/route.ts`
- Create: `app/api/accounts/[id]/route.ts`

- [ ] **Step 1: Create modules/accounts/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { Account } from "./types";

export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await supabase()
    .from("accounts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAccountById(id: string): Promise<Account | null> {
  const { data, error } = await supabase()
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createAccount(
  account: Pick<Account, "name" | "handle" | "platform"> & { avatar_url?: string }
): Promise<Account> {
  const { data, error } = await supabase()
    .from("accounts")
    .insert({ ...account, active: true })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccount(
  id: string,
  fields: Partial<Pick<Account, "name" | "handle" | "platform" | "avatar_url" | "active">>
): Promise<Account> {
  const { data, error } = await supabase()
    .from("accounts")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create modules/accounts/actions.ts**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createAccount as dbCreate, updateAccount as dbUpdate } from "./queries";

export async function createAccountAction(formData: FormData) {
  const name = formData.get("name") as string;
  const handle = formData.get("handle") as string;
  const platform = (formData.get("platform") as string) || "instagram";
  const avatar_url = (formData.get("avatar_url") as string) || undefined;

  const account = await dbCreate({ name, handle, platform, avatar_url });
  revalidatePath("/contas");
  return account;
}

export async function updateAccountAction(id: string, formData: FormData) {
  const fields: Record<string, string> = {};
  for (const key of ["name", "handle", "platform", "avatar_url"]) {
    const val = formData.get(key);
    if (val) fields[key] = val as string;
  }

  const account = await dbUpdate(id, fields);
  revalidatePath("/contas");
  return account;
}
```

- [ ] **Step 3: Create app/api/accounts/route.ts**

```typescript
import { NextResponse } from "next/server";
import { listAccounts, createAccount } from "@/modules/accounts/queries";

export async function GET() {
  const accounts = await listAccounts();
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const account = await createAccount(body);
  return NextResponse.json(account, { status: 201 });
}
```

- [ ] **Step 4: Create app/api/accounts/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getAccountById, updateAccount } from "@/modules/accounts/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccountById(id);
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(account);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const account = await updateAccount(id, body);
  return NextResponse.json(account);
}
```

- [ ] **Step 5: Commit**

```bash
git add modules/accounts/queries.ts modules/accounts/actions.ts app/api/accounts/
git commit -m "feat: accounts module — queries, actions, API routes

- queries.ts: list, getById, create, update
- actions.ts: server actions for form submissions
- API: GET /api/accounts, POST /api/accounts, GET/PATCH /api/accounts/[id]"
```

---

## Task 4: Playbook Module (queries + actions + prompt-builder)

**Files:**
- Create: `modules/playbook/queries.ts`
- Create: `modules/playbook/actions.ts`
- Create: `modules/playbook/prompt-builder.ts`
- Create: `app/api/playbook/route.ts`

- [ ] **Step 1: Create modules/playbook/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { BrandPlaybook } from "./types";

export async function getPlaybookByAccountId(accountId: string): Promise<BrandPlaybook | null> {
  const { data, error } = await supabase()
    .from("brand_playbooks")
    .select("*")
    .eq("account_id", accountId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertPlaybook(
  accountId: string,
  fields: Partial<Omit<BrandPlaybook, "id" | "account_id" | "updated_at">>
): Promise<BrandPlaybook> {
  const { data, error } = await supabase()
    .from("brand_playbooks")
    .upsert(
      { account_id: accountId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: "account_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create modules/playbook/actions.ts**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { upsertPlaybook } from "./queries";

export async function savePlaybookAction(accountId: string, formData: FormData) {
  const fields = {
    tone_of_voice: formData.get("tone_of_voice") as string | null,
    style: formData.get("style") as string | null,
    mandatory_words: parseArray(formData.get("mandatory_words") as string),
    forbidden_words: parseArray(formData.get("forbidden_words") as string),
    default_cta: formData.get("default_cta") as string | null,
    do_examples: formData.get("do_examples") as string | null,
    dont_examples: formData.get("dont_examples") as string | null,
    extra_instructions: formData.get("extra_instructions") as string | null,
  };

  await upsertPlaybook(accountId, fields);
  revalidatePath(`/${accountId}/playbook`);
}

function parseArray(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
```

- [ ] **Step 3: Create modules/playbook/prompt-builder.ts**

```typescript
import type { BrandPlaybook } from "./types";

export function buildSystemPrompt(playbook: BrandPlaybook | null): string {
  if (!playbook) {
    return "Voce e um social media profissional. Gere conteudo de alta qualidade para redes sociais.";
  }

  const parts: string[] = [
    "Voce e o social media desta marca. Siga rigorosamente as diretrizes abaixo.",
    "",
  ];

  if (playbook.tone_of_voice) {
    parts.push(`## Tom de voz\n${playbook.tone_of_voice}`);
  }

  if (playbook.style) {
    parts.push(`## Estilo editorial\n${playbook.style}`);
  }

  if (playbook.mandatory_words.length > 0) {
    parts.push(`## Palavras obrigatorias (use sempre que possivel)\n${playbook.mandatory_words.join(", ")}`);
  }

  if (playbook.forbidden_words.length > 0) {
    parts.push(`## Palavras PROIBIDAS (NUNCA use)\n${playbook.forbidden_words.join(", ")}`);
  }

  if (playbook.default_cta) {
    parts.push(`## CTA padrao\n${playbook.default_cta}`);
  }

  if (playbook.do_examples) {
    parts.push(`## Jeito CERTO de falar (siga este tom)\n${playbook.do_examples}`);
  }

  if (playbook.dont_examples) {
    parts.push(`## Jeito ERRADO de falar (NAO faca assim)\n${playbook.dont_examples}`);
  }

  if (playbook.post_examples.length > 0) {
    const examplesText = playbook.post_examples
      .map((ex, i) => {
        let entry = `### Exemplo ${i + 1}\n`;
        entry += `Legenda: ${ex.caption}\n`;
        entry += `Hashtags: ${ex.hashtags}\n`;
        entry += `Pilar: ${ex.pilar} | Formato: ${ex.format}`;
        if (ex.engagement_rate) entry += ` | Engagement: ${ex.engagement_rate}%`;
        if (ex.notes) entry += `\nNotas: ${ex.notes}`;
        return entry;
      })
      .join("\n\n");
    parts.push(`## Exemplos reais de posts (use como referencia de tom e estilo)\n${examplesText}`);
  }

  if (playbook.extra_instructions) {
    parts.push(`## Instrucoes adicionais\n${playbook.extra_instructions}`);
  }

  return parts.join("\n\n");
}
```

- [ ] **Step 4: Create app/api/playbook/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getPlaybookByAccountId, upsertPlaybook } from "@/modules/playbook/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const playbook = await getPlaybookByAccountId(accountId);
  return NextResponse.json(playbook);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { account_id, ...fields } = body;
  if (!account_id) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const playbook = await upsertPlaybook(account_id, fields);
  return NextResponse.json(playbook);
}
```

- [ ] **Step 5: Commit**

```bash
git add modules/playbook/ app/api/playbook/
git commit -m "feat: playbook module — queries, actions, prompt-builder, API

- queries.ts: getByAccountId, upsert (insert or update)
- actions.ts: savePlaybookAction server action
- prompt-builder.ts: builds dynamic system prompt from brand playbook fields + few-shot examples
- API: GET/PUT /api/playbook?account_id=..."
```

---

## Task 5: Status Machine

**Files:**
- Create: `modules/pieces/status-machine.ts`

- [ ] **Step 1: Create modules/pieces/status-machine.ts**

```typescript
import type { PieceStatus } from "@/modules/accounts/types";

const VALID_TRANSITIONS: Record<PieceStatus, PieceStatus[]> = {
  reference: ["idea"],
  idea: ["idea_approved", "rejected"],
  idea_approved: ["in_production"],
  in_production: ["final_approved", "rejected"],
  final_approved: ["scheduled"],
  scheduled: ["published"],
  rejected: ["in_adjustment"],
  in_adjustment: ["in_production"],
  published: [],
  paused: [], // handled separately — returns to previous status
};

// Any status except published can be paused
const PAUSABLE: PieceStatus[] = [
  "reference", "idea", "idea_approved", "in_production",
  "final_approved", "scheduled", "rejected", "in_adjustment",
];

export function canTransition(from: PieceStatus, to: PieceStatus): boolean {
  if (to === "paused") return PAUSABLE.includes(from);
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidNextStatuses(current: PieceStatus): PieceStatus[] {
  const next = [...(VALID_TRANSITIONS[current] ?? [])];
  if (PAUSABLE.includes(current)) next.push("paused");
  return next;
}

export function validateTransition(from: PieceStatus, to: PieceStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} → ${to}`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/pieces/status-machine.ts
git commit -m "feat: piece status machine — 10 states with valid transitions

- VALID_TRANSITIONS map covering full pipeline flow
- canTransition, getValidNextStatuses, validateTransition
- Pause support: any non-published status can be paused"
```

---

## Task 6: Pieces Module (queries + actions + API)

**Files:**
- Create: `modules/pieces/queries.ts`
- Create: `modules/pieces/actions.ts`
- Create: `app/api/pieces/route.ts`
- Create: `app/api/pieces/[id]/route.ts`
- Create: `app/api/pieces/[id]/versions/route.ts`

- [ ] **Step 1: Create modules/pieces/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { Piece, PieceVersion } from "./types";
import type { PieceStatus } from "@/modules/accounts/types";

export async function listPieces(
  accountId: string,
  filters?: { status?: PieceStatus; limit?: number }
): Promise<Piece[]> {
  let query = supabase()
    .from("pieces")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPieceById(id: string): Promise<Piece | null> {
  const { data, error } = await supabase()
    .from("pieces")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createPiece(
  piece: Omit<Piece, "id" | "created_at" | "updated_at" | "current_version">
): Promise<Piece> {
  const { data, error } = await supabase()
    .from("pieces")
    .insert({ ...piece, current_version: 1 })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePiece(
  id: string,
  fields: Partial<Omit<Piece, "id" | "created_at">>
): Promise<Piece> {
  const { data, error } = await supabase()
    .from("pieces")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listVersions(pieceId: string): Promise<PieceVersion[]> {
  const { data, error } = await supabase()
    .from("piece_versions")
    .select("*")
    .eq("piece_id", pieceId)
    .order("version", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createVersion(
  version: Omit<PieceVersion, "id" | "created_at">
): Promise<PieceVersion> {
  const { data, error } = await supabase()
    .from("piece_versions")
    .insert(version)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create modules/pieces/actions.ts**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { getPieceById, updatePiece, createVersion } from "./queries";
import { validateTransition } from "./status-machine";
import type { PieceStatus } from "@/modules/accounts/types";

export async function transitionPieceStatus(
  pieceId: string,
  newStatus: PieceStatus,
  reason?: string
) {
  const piece = await getPieceById(pieceId);
  if (!piece) throw new Error("Piece not found");

  validateTransition(piece.status, newStatus);

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === "rejected" && reason) {
    updates.rejection_reason = reason;
  }
  if (newStatus === "published") {
    updates.published_date = new Date().toISOString();
  }

  await updatePiece(pieceId, updates);
  revalidatePath(`/${piece.account_id}/pipeline`);
}

export async function savePieceAction(pieceId: string, formData: FormData) {
  const piece = await getPieceById(pieceId);
  if (!piece) throw new Error("Piece not found");

  const fields: Record<string, unknown> = {};
  for (const key of [
    "title", "hook", "caption", "hashtags", "cta", "layout",
    "creative_brief", "visual_direction", "scheduled_date", "scheduled_time",
  ]) {
    const val = formData.get(key);
    if (val !== null) fields[key] = val;
  }

  const slideStructure = formData.get("slide_structure");
  if (slideStructure) {
    fields.slide_structure = JSON.parse(slideStructure as string);
  }

  // Create version snapshot before saving
  await createVersion({
    piece_id: pieceId,
    version: piece.current_version + 1,
    caption: (formData.get("caption") as string) || piece.caption,
    hashtags: (formData.get("hashtags") as string) || piece.hashtags,
    image_url: piece.image_url,
    creative_brief: (formData.get("creative_brief") as string) || piece.creative_brief,
    visual_direction: (formData.get("visual_direction") as string) || piece.visual_direction,
    slide_structure: slideStructure ? JSON.parse(slideStructure as string) : piece.slide_structure,
    change_type: (formData.get("change_type") as string) || "copy",
    feedback: (formData.get("feedback") as string) || null,
  });

  fields.current_version = piece.current_version + 1;

  await updatePiece(pieceId, fields);
  revalidatePath(`/${piece.account_id}/pecas/${pieceId}`);
}
```

- [ ] **Step 3: Create app/api/pieces/route.ts**

```typescript
import { NextResponse } from "next/server";
import { listPieces, createPiece } from "@/modules/pieces/queries";
import type { PieceStatus } from "@/modules/accounts/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const status = searchParams.get("status") as PieceStatus | null;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  const pieces = await listPieces(accountId, {
    status: status || undefined,
    limit,
  });
  return NextResponse.json(pieces);
}

export async function POST(request: Request) {
  const body = await request.json();
  const piece = await createPiece(body);
  return NextResponse.json(piece, { status: 201 });
}
```

- [ ] **Step 4: Create app/api/pieces/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getPieceById, updatePiece } from "@/modules/pieces/queries";
import { validateTransition } from "@/modules/pieces/status-machine";
import type { PieceStatus } from "@/modules/accounts/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const piece = await getPieceById(id);
  if (!piece) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(piece);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  // If status transition, validate it
  if (body.status) {
    const piece = await getPieceById(id);
    if (!piece) return NextResponse.json({ error: "Not found" }, { status: 404 });
    validateTransition(piece.status, body.status as PieceStatus);
  }

  const piece = await updatePiece(id, body);
  return NextResponse.json(piece);
}
```

- [ ] **Step 5: Create app/api/pieces/[id]/versions/route.ts**

```typescript
import { NextResponse } from "next/server";
import { listVersions, createVersion } from "@/modules/pieces/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const versions = await listVersions(id);
  return NextResponse.json(versions);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const version = await createVersion({ ...body, piece_id: id });
  return NextResponse.json(version, { status: 201 });
}
```

- [ ] **Step 6: Commit**

```bash
git add modules/pieces/queries.ts modules/pieces/actions.ts app/api/pieces/
git commit -m "feat: pieces module — queries, actions with status machine, API routes

- queries.ts: list (with filters), getById, create, update, listVersions, createVersion
- actions.ts: transitionPieceStatus (validates via status machine), savePieceAction (auto-versions)
- API: GET/POST /api/pieces, GET/PATCH /api/pieces/[id], GET/POST /api/pieces/[id]/versions"
```

---

## Task 7: References Module (queries + extractor)

**Files:**
- Create: `modules/references/queries.ts`
- Create: `modules/references/actions.ts`
- Create: `modules/references/extractor.ts`
- Create: `app/api/references/route.ts`
- Create: `app/api/references/[id]/route.ts`

- [ ] **Step 1: Install dependencies for content extraction**

```bash
npm install @mozilla/readability linkedom pdf-parse
npm install -D @types/pdf-parse
```

Note: `linkedom` is used instead of `jsdom` because it's lighter and works in serverless environments. `@mozilla/readability` extracts clean text from HTML pages.

- [ ] **Step 2: Create modules/references/extractor.ts**

```typescript
import type { ReferenceType } from "./types";

export async function extractContent(
  type: ReferenceType,
  source: string
): Promise<string> {
  switch (type) {
    case "link":
      return extractFromLink(source);
    case "pdf":
      return extractFromPdf(source);
    case "text":
      return source;
    case "file":
      return source; // raw content passed directly for uploaded text files
    default:
      throw new Error(`Unsupported reference type: ${type}`);
  }
}

async function extractFromLink(url: string): Promise<string> {
  const { Readability } = await import("@mozilla/readability");
  const { parseHTML } = await import("linkedom");

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GecapsBot/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const { document } = parseHTML(html);
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article?.textContent) {
    throw new Error("Could not extract content from URL");
  }

  // Limit to ~10k chars to avoid huge prompts
  return article.textContent.slice(0, 10000);
}

async function extractFromPdf(base64OrUrl: string): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;

  let buffer: Buffer;
  if (base64OrUrl.startsWith("http")) {
    const response = await fetch(base64OrUrl);
    buffer = Buffer.from(await response.arrayBuffer());
  } else {
    buffer = Buffer.from(base64OrUrl, "base64");
  }

  const result = await pdfParse(buffer);
  return result.text.slice(0, 10000);
}
```

- [ ] **Step 3: Create modules/references/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { Reference, ReferenceStatus } from "./types";

export async function listReferences(
  accountId: string,
  filters?: { status?: ReferenceStatus; limit?: number }
): Promise<Reference[]> {
  let query = supabase()
    .from("references")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getReferenceById(id: string): Promise<Reference | null> {
  const { data, error } = await supabase()
    .from("references")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createReference(
  ref: Pick<Reference, "account_id" | "type" | "source_url" | "raw_content" | "file_url">
): Promise<Reference> {
  const { data, error } = await supabase()
    .from("references")
    .insert({ ...ref, status: "novo" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReferenceProcessed(
  id: string,
  fields: Pick<Reference, "summary" | "tags" | "suggested_pilar" | "suggested_format" | "relevance_score">
): Promise<Reference> {
  const { data, error } = await supabase()
    .from("references")
    .update({
      ...fields,
      status: "triado" as ReferenceStatus,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReferenceStatus(
  id: string,
  status: ReferenceStatus
): Promise<void> {
  const { error } = await supabase()
    .from("references")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteReference(id: string): Promise<void> {
  const { error } = await supabase()
    .from("references")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
```

- [ ] **Step 4: Create modules/references/actions.ts**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createReference, deleteReference as dbDelete } from "./queries";
import { extractContent } from "./extractor";
import type { ReferenceType } from "./types";

export async function addReferenceAction(accountId: string, formData: FormData) {
  const type = formData.get("type") as ReferenceType;
  const sourceUrl = formData.get("source_url") as string | null;
  const rawText = formData.get("raw_content") as string | null;
  const fileUrl = formData.get("file_url") as string | null;

  let rawContent: string | null = null;

  if (type === "link" && sourceUrl) {
    rawContent = await extractContent("link", sourceUrl);
  } else if (type === "text" && rawText) {
    rawContent = rawText;
  } else if (type === "pdf" && fileUrl) {
    rawContent = await extractContent("pdf", fileUrl);
  } else if (type === "file" && fileUrl) {
    rawContent = fileUrl; // for text files, content is passed directly
  }

  const ref = await createReference({
    account_id: accountId,
    type,
    source_url: sourceUrl,
    raw_content: rawContent,
    file_url: fileUrl,
  });

  revalidatePath(`/${accountId}/referencias`);
  return ref;
}

export async function deleteReferenceAction(accountId: string, referenceId: string) {
  await dbDelete(referenceId);
  revalidatePath(`/${accountId}/referencias`);
}
```

- [ ] **Step 5: Create app/api/references/route.ts**

```typescript
import { NextResponse } from "next/server";
import { listReferences, createReference } from "@/modules/references/queries";
import { extractContent } from "@/modules/references/extractor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const refs = await listReferences(accountId);
  return NextResponse.json(refs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { account_id, type, source_url, raw_content: rawText, file_url } = body;

  let raw_content = rawText;
  if (type === "link" && source_url && !raw_content) {
    raw_content = await extractContent("link", source_url);
  } else if (type === "pdf" && file_url && !raw_content) {
    raw_content = await extractContent("pdf", file_url);
  }

  const ref = await createReference({ account_id, type, source_url, raw_content, file_url });
  return NextResponse.json(ref, { status: 201 });
}
```

- [ ] **Step 6: Create app/api/references/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getReferenceById, deleteReference } from "@/modules/references/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = await getReferenceById(id);
  if (!ref) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ref);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteReference(id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Commit**

```bash
git add modules/references/ app/api/references/
git commit -m "feat: references module — queries, extractor, actions, API

- queries.ts: list, getById, create, updateProcessed, updateStatus, delete
- extractor.ts: extract content from links (Readability), PDFs (pdf-parse), text
- actions.ts: addReferenceAction (extracts on add), deleteReferenceAction
- API: GET/POST /api/references, GET/DELETE /api/references/[id]
- Deps: @mozilla/readability, linkedom, pdf-parse"
```

---

## Task 8: Ideas Module (queries + actions + API)

**Files:**
- Create: `modules/ideas/queries.ts`
- Create: `modules/ideas/actions.ts`
- Create: `app/api/ideas/route.ts`
- Create: `app/api/ideas/[id]/route.ts`

- [ ] **Step 1: Create modules/ideas/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { Idea, IdeaStatus } from "./types";

export async function listIdeas(
  accountId: string,
  filters?: { status?: IdeaStatus; referenceId?: string }
): Promise<Idea[]> {
  let query = supabase()
    .from("ideas")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.referenceId) query = query.eq("reference_id", filters.referenceId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const { data, error } = await supabase()
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createIdea(
  idea: Omit<Idea, "id" | "created_at">
): Promise<Idea> {
  const { data, error } = await supabase()
    .from("ideas")
    .insert(idea)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIdeaStatus(
  id: string,
  status: IdeaStatus
): Promise<Idea> {
  const { data, error } = await supabase()
    .from("ideas")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create modules/ideas/actions.ts**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createIdea, updateIdeaStatus, getIdeaById } from "./queries";
import type { IdeaStatus } from "./types";

export async function createManualIdeaAction(accountId: string, formData: FormData) {
  const idea = await createIdea({
    account_id: accountId,
    reference_id: null,
    theme: formData.get("theme") as string,
    angle: formData.get("angle") as string | null,
    objective: formData.get("objective") as string | null,
    suggested_format: formData.get("suggested_format") as string | null,
    justification: formData.get("justification") as string | null,
    brand_fit: null,
    status: "pending",
    is_manual: true,
  });

  revalidatePath(`/${accountId}/ideias`);
  return idea;
}

export async function approveIdeaAction(accountId: string, ideaId: string) {
  await updateIdeaStatus(ideaId, "approved");
  revalidatePath(`/${accountId}/ideias`);
}

export async function rejectIdeaAction(accountId: string, ideaId: string) {
  await updateIdeaStatus(ideaId, "rejected");
  revalidatePath(`/${accountId}/ideias`);
}
```

- [ ] **Step 3: Create app/api/ideas/route.ts**

```typescript
import { NextResponse } from "next/server";
import { listIdeas, createIdea } from "@/modules/ideas/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const referenceId = searchParams.get("reference_id") || undefined;
  const status = searchParams.get("status") as "pending" | "approved" | "rejected" | undefined;

  const ideas = await listIdeas(accountId, { status, referenceId });
  return NextResponse.json(ideas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const idea = await createIdea(body);
  return NextResponse.json(idea, { status: 201 });
}
```

- [ ] **Step 4: Create app/api/ideas/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getIdeaById, updateIdeaStatus } from "@/modules/ideas/queries";
import type { IdeaStatus } from "@/modules/ideas/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await getIdeaById(id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json();
  const idea = await updateIdeaStatus(id, status as IdeaStatus);
  return NextResponse.json(idea);
}
```

- [ ] **Step 5: Commit**

```bash
git add modules/ideas/ app/api/ideas/
git commit -m "feat: ideas module — queries, actions, API routes

- queries.ts: list (by account, status, reference), getById, create, updateStatus
- actions.ts: createManualIdeaAction, approveIdeaAction, rejectIdeaAction
- API: GET/POST /api/ideas, GET/PATCH /api/ideas/[id]"
```

---

## Task 9: AI Module (client + prompts + pipeline)

**Files:**
- Create: `modules/ai/client.ts`
- Create: `modules/ai/prompts/reference.ts`
- Create: `modules/ai/prompts/ideas.ts`
- Create: `modules/ai/prompts/piece.ts`
- Create: `modules/ai/prompts/insights.ts`
- Create: `modules/ai/pipeline.ts`

- [ ] **Step 1: Create modules/ai/client.ts**

```typescript
import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAIClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return _client;
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000
): Promise<string> {
  const response = await getAIClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000
): Promise<T> {
  const text = await generateText(systemPrompt, userPrompt, maxTokens);

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  return JSON.parse(jsonMatch[1]) as T;
}
```

- [ ] **Step 2: Create modules/ai/prompts/reference.ts**

```typescript
export function buildReferenceUserPrompt(rawContent: string): string {
  return `Analise o conteudo abaixo e gere um resumo contextualizado para a marca.

## Conteudo bruto
${rawContent}

## Tarefa
Responda em JSON com exatamente estes campos:
{
  "summary": "resumo de 3-5 frases contextualizando o conteudo para a marca",
  "tags": ["tag1", "tag2", "tag3"],
  "suggested_pilar": "educativo|autoridade|produto|conexao|social-proof|objecao",
  "suggested_format": "estatico|carrossel|reels|story",
  "relevance_score": 7
}

Regras:
- O resumo deve ser contextualizado para o universo da marca (conforme system prompt)
- Tags devem ser curtas e em portugues
- relevance_score: 1 (irrelevante) a 10 (altamente relevante)
- Pilar e formato sao sugestoes baseadas no conteudo`;
}
```

- [ ] **Step 3: Create modules/ai/prompts/ideas.ts**

```typescript
import type { Reference } from "@/modules/references/types";
import type { Idea } from "@/modules/ideas/types";

export function buildIdeasUserPrompt(
  reference: Reference,
  existingIdeas: Idea[]
): string {
  const existingThemes = existingIdeas.map((i) => `- ${i.theme}`).join("\n");

  return `Gere 5 ideias de conteudo a partir desta referencia.

## Referencia
Resumo: ${reference.summary}
Tags: ${reference.tags.join(", ")}
Pilar sugerido: ${reference.suggested_pilar}
Formato sugerido: ${reference.suggested_format}
Conteudo original (trecho): ${(reference.raw_content || "").slice(0, 3000)}

${existingThemes ? `## Ideias ja existentes (NAO repetir)\n${existingThemes}` : ""}

## Tarefa
Gere exatamente 5 ideias diferentes. Responda em JSON:
{
  "ideas": [
    {
      "theme": "titulo curto da ideia",
      "angle": "angulo editorial especifico",
      "objective": "objetivo do post (educar, engajar, converter, etc)",
      "suggested_format": "estatico|carrossel|reels|story",
      "justification": "por que essa ideia funciona para a marca",
      "brand_fit": "como se conecta com a identidade da marca"
    }
  ]
}

Regras:
- Cada ideia com angulo diferente
- Variar formatos sugeridos
- Justificativa deve ser especifica, nao generica
- Considerar o tom e estilo definidos no system prompt`;
}
```

- [ ] **Step 4: Create modules/ai/prompts/piece.ts**

```typescript
import type { Idea } from "@/modules/ideas/types";
import type { Reference } from "@/modules/references/types";
import type { Piece } from "@/modules/pieces/types";

export function buildPieceUserPrompt(
  idea: Idea,
  reference: Reference | null,
  topPosts: Piece[]
): string {
  const topPostsText = topPosts.length > 0
    ? topPosts
        .map((p, i) => `Post ${i + 1}: "${p.caption?.slice(0, 200)}" (${p.pilar}, ${p.format})`)
        .join("\n")
    : "Nenhum post anterior disponivel.";

  return `Gere uma peca completa para redes sociais a partir desta ideia.

## Ideia aprovada
Tema: ${idea.theme}
Angulo: ${idea.angle}
Objetivo: ${idea.objective}
Formato sugerido: ${idea.suggested_format}

${reference ? `## Referencia original\nResumo: ${reference.summary}\nConteudo (trecho): ${(reference.raw_content || "").slice(0, 2000)}` : ""}

## Posts de melhor performance (few-shot)
${topPostsText}

## Tarefa
Gere a peca completa. Responda em JSON:
{
  "title": "titulo do post (maximo 80 chars)",
  "hook": "frase de abertura que prende atencao",
  "caption": "legenda completa do Instagram (150-300 palavras)",
  "hashtags": "#tag1 #tag2 #tag3 (5-8 hashtags)",
  "cta": "chamada pra acao final",
  "creative_brief": "descricao do que a imagem deve mostrar (para designer/IA visual)",
  "visual_direction": "cores, mood, estilo visual sugerido",
  "pilar": "educativo|autoridade|produto|conexao|social-proof|objecao",
  "format": "estatico|carrossel|reels|story",
  "layout": "branco|verde|quote|foto",
  "slide_structure": null
}

Se o formato for "carrossel", slide_structure deve ser um array de objetos:
[{"slide": 1, "title": "...", "body": "...", "visual_note": "..."}]

Regras:
- Seguir rigorosamente o tom e estilo do system prompt
- Hook deve ser curiosidade ou provocacao, NAO clickbait
- Caption com paragrafos curtos, linguagem acessivel
- CTA deve usar o padrao da marca se definido
- Layout sugerido deve combinar com o conteudo`;
}
```

- [ ] **Step 5: Create modules/ai/prompts/insights.ts**

```typescript
import type { Metrics } from "@/modules/metrics/types";
import type { Piece } from "@/modules/pieces/types";

export function buildInsightsUserPrompt(
  piecesWithMetrics: Array<Piece & { metrics: Metrics }>
): string {
  const dataRows = piecesWithMetrics
    .map((p) => {
      const m = p.metrics;
      return `- "${p.title}" (${p.pilar}, ${p.format}): likes=${m.likes}, comments=${m.comments}, shares=${m.shares}, saves=${m.saves}, reach=${m.reach}, engagement=${m.engagement_rate}%`;
    })
    .join("\n");

  return `Analise o desempenho dos conteudos publicados e gere insights acionaveis.

## Dados de performance
${dataRows}

## Tarefa
Responda em JSON:
{
  "insights": [
    {
      "content": "insight completo e acionavel (2-4 frases)",
      "type": "auto"
    }
  ]
}

Gere entre 3 e 7 insights cobrindo:
1. Quais pilares/formatos estao performando melhor e por que
2. Quais estao abaixo do esperado
3. Padroes identificados (horario, tipo de conteudo, tom)
4. Sugestoes especificas de proximos conteudos
5. O que mudar na estrategia

Regras:
- Insights devem ser especificos e baseados nos dados, NAO genericos
- Cada insight deve ter uma acao clara
- Considerar o contexto da marca (system prompt)`;
}
```

- [ ] **Step 6: Create modules/ai/pipeline.ts**

```typescript
import { generateJSON } from "./client";
import { buildSystemPrompt } from "@/modules/playbook/prompt-builder";
import { getPlaybookByAccountId } from "@/modules/playbook/queries";
import { getReferenceById, updateReferenceProcessed, updateReferenceStatus } from "@/modules/references/queries";
import { listIdeas, createIdea } from "@/modules/ideas/queries";
import { createPiece } from "@/modules/pieces/queries";
import { getIdeaById } from "@/modules/ideas/queries";
import { buildReferenceUserPrompt } from "./prompts/reference";
import { buildIdeasUserPrompt } from "./prompts/ideas";
import { buildPieceUserPrompt } from "./prompts/piece";
import { buildInsightsUserPrompt } from "./prompts/insights";
import type { Reference } from "@/modules/references/types";
import type { Piece } from "@/modules/pieces/types";
import type { Metrics } from "@/modules/metrics/types";

// ── 1. Process Reference ──────────────────────
export async function processReference(referenceId: string) {
  const ref = await getReferenceById(referenceId);
  if (!ref || !ref.raw_content) throw new Error("Reference not found or empty");

  const playbook = await getPlaybookByAccountId(ref.account_id);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildReferenceUserPrompt(ref.raw_content);

  const result = await generateJSON<{
    summary: string;
    tags: string[];
    suggested_pilar: string;
    suggested_format: string;
    relevance_score: number;
  }>(systemPrompt, userPrompt, 1000);

  await updateReferenceProcessed(referenceId, result);
  return result;
}

// ── 2. Generate Ideas ─────────────────────────
export async function generateIdeasFromReference(referenceId: string) {
  const ref = await getReferenceById(referenceId);
  if (!ref) throw new Error("Reference not found");

  const playbook = await getPlaybookByAccountId(ref.account_id);
  const systemPrompt = buildSystemPrompt(playbook);
  const existingIdeas = await listIdeas(ref.account_id);
  const userPrompt = buildIdeasUserPrompt(ref, existingIdeas);

  const result = await generateJSON<{
    ideas: Array<{
      theme: string;
      angle: string;
      objective: string;
      suggested_format: string;
      justification: string;
      brand_fit: string;
    }>;
  }>(systemPrompt, userPrompt, 2000);

  const created = [];
  for (const idea of result.ideas) {
    const saved = await createIdea({
      account_id: ref.account_id,
      reference_id: referenceId,
      theme: idea.theme,
      angle: idea.angle,
      objective: idea.objective,
      suggested_format: idea.suggested_format,
      justification: idea.justification,
      brand_fit: idea.brand_fit,
      status: "pending",
      is_manual: false,
    });
    created.push(saved);
  }

  await updateReferenceStatus(referenceId, "virou_ideia");
  return created;
}

// ── 3. Generate Piece ─────────────────────────
export async function generatePieceFromIdea(
  ideaId: string,
  topPosts: Piece[] = []
) {
  const idea = await getIdeaById(ideaId);
  if (!idea) throw new Error("Idea not found");

  const ref = idea.reference_id ? await getReferenceById(idea.reference_id) : null;
  const playbook = await getPlaybookByAccountId(idea.account_id);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildPieceUserPrompt(idea, ref, topPosts);

  const result = await generateJSON<{
    title: string;
    hook: string;
    caption: string;
    hashtags: string;
    cta: string;
    creative_brief: string;
    visual_direction: string;
    pilar: string;
    format: string;
    layout: string;
    slide_structure: Record<string, unknown>[] | null;
  }>(systemPrompt, userPrompt, 3000);

  const piece = await createPiece({
    account_id: idea.account_id,
    idea_id: ideaId,
    title: result.title,
    hook: result.hook,
    pilar: result.pilar as Piece["pilar"],
    format: result.format as Piece["format"],
    status: "in_production",
    scheduled_date: null,
    scheduled_time: null,
    published_date: null,
    caption: result.caption,
    hashtags: result.hashtags,
    cta: result.cta,
    image_url: null,
    layout: result.layout as Piece["layout"],
    creative_brief: result.creative_brief,
    visual_direction: result.visual_direction,
    slide_structure: result.slide_structure,
    rejection_reason: null,
  });

  return piece;
}

// ── 4. Generate Insights ──────────────────────
export async function generateInsights(
  accountId: string,
  piecesWithMetrics: Array<Piece & { metrics: Metrics }>
) {
  const playbook = await getPlaybookByAccountId(accountId);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildInsightsUserPrompt(piecesWithMetrics);

  const result = await generateJSON<{
    insights: Array<{ content: string; type: string }>;
  }>(systemPrompt, userPrompt, 2000);

  return result.insights;
}
```

- [ ] **Step 7: Commit**

```bash
git add modules/ai/
git commit -m "feat: AI module — client, 4 prompt templates, pipeline orchestrator

- client.ts: Claude SDK singleton, generateText, generateJSON helpers
- prompts/reference.ts: reference processing prompt
- prompts/ideas.ts: 5-idea generation prompt
- prompts/piece.ts: full piece generation prompt
- prompts/insights.ts: performance insights prompt
- pipeline.ts: processReference, generateIdeasFromReference, generatePieceFromIdea, generateInsights"
```

---

## Task 10: AI API Routes

**Files:**
- Create: `app/api/ai/process-reference/route.ts`
- Create: `app/api/ai/generate-ideas/route.ts`
- Create: `app/api/ai/generate-piece/route.ts`
- Create: `app/api/ai/generate-caption/route.ts`
- Create: `app/api/ai/generate-insights/route.ts`

- [ ] **Step 1: Create app/api/ai/process-reference/route.ts**

```typescript
import { NextResponse } from "next/server";
import { processReference } from "@/modules/ai/pipeline";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { reference_id } = await request.json();
  if (!reference_id) return NextResponse.json({ error: "reference_id required" }, { status: 400 });

  const result = await processReference(reference_id);
  return NextResponse.json(result);
}
```

- [ ] **Step 2: Create app/api/ai/generate-ideas/route.ts**

```typescript
import { NextResponse } from "next/server";
import { generateIdeasFromReference } from "@/modules/ai/pipeline";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { reference_id } = await request.json();
  if (!reference_id) return NextResponse.json({ error: "reference_id required" }, { status: 400 });

  const ideas = await generateIdeasFromReference(reference_id);
  return NextResponse.json(ideas);
}
```

- [ ] **Step 3: Create app/api/ai/generate-piece/route.ts**

```typescript
import { NextResponse } from "next/server";
import { generatePieceFromIdea } from "@/modules/ai/pipeline";
import { listPieces } from "@/modules/pieces/queries";
import { getIdeaById } from "@/modules/ideas/queries";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { idea_id } = await request.json();
  if (!idea_id) return NextResponse.json({ error: "idea_id required" }, { status: 400 });

  const idea = await getIdeaById(idea_id);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  // Get top published posts as few-shot examples
  const published = await listPieces(idea.account_id, { status: "published", limit: 5 });

  const piece = await generatePieceFromIdea(idea_id, published);
  return NextResponse.json(piece);
}
```

- [ ] **Step 4: Create app/api/ai/generate-caption/route.ts**

```typescript
import { NextResponse } from "next/server";
import { generateText } from "@/modules/ai/client";
import { buildSystemPrompt } from "@/modules/playbook/prompt-builder";
import { getPlaybookByAccountId } from "@/modules/playbook/queries";

export async function POST(request: Request) {
  const { title, hook, pilar, cta, account_id } = await request.json();

  let systemPrompt = "Voce e um social media profissional. Gere legendas para Instagram.";
  if (account_id) {
    const playbook = await getPlaybookByAccountId(account_id);
    systemPrompt = buildSystemPrompt(playbook);
  }

  const userPrompt = `Gere uma legenda para Instagram.

Titulo: ${title}
Hook: ${hook}
Pilar: ${pilar}
CTA: ${cta}

Regras:
- NAO usar travessoes
- Maximo 2-3 emojis no texto todo
- Comecar com o hook pra prender atencao
- Terminar com CTA claro
- Entre 150-300 palavras
- Gerar 5-8 hashtags relevantes

Responda em JSON: {"caption": "...", "hashtags": "#tag1 #tag2 #tag3"}`;

  const text = await generateText(systemPrompt, userPrompt, 800);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch {}

  return NextResponse.json({ caption: text, hashtags: "#gecaps #cosmeticos #marcapropria" });
}
```

- [ ] **Step 5: Create app/api/ai/generate-insights/route.ts**

```typescript
import { NextResponse } from "next/server";
import { generateInsights } from "@/modules/ai/pipeline";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { account_id } = await request.json();
  if (!account_id) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  // Get published pieces with their metrics
  const { data: pieces } = await supabase()
    .from("pieces")
    .select("*, metrics(*)")
    .eq("account_id", account_id)
    .eq("status", "published")
    .not("metrics", "is", null);

  if (!pieces || pieces.length === 0) {
    return NextResponse.json({ error: "No published pieces with metrics" }, { status: 400 });
  }

  const piecesWithMetrics = pieces.map((p: Record<string, unknown>) => ({
    ...p,
    metrics: Array.isArray(p.metrics) ? p.metrics[0] : p.metrics,
  }));

  const insights = await generateInsights(account_id, piecesWithMetrics);

  // Save insights to DB
  const saved = [];
  for (const insight of insights) {
    const { data } = await supabase()
      .from("insights")
      .insert({
        account_id,
        content: insight.content,
        type: "auto",
        source_pieces: pieces.map((p: Record<string, unknown>) => p.id),
      })
      .select()
      .single();
    if (data) saved.push(data);
  }

  return NextResponse.json(saved);
}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/ai/
git commit -m "feat: AI API routes — 5 endpoints for the full IA pipeline

- POST /api/ai/process-reference: extract + summarize + tag
- POST /api/ai/generate-ideas: 5 ideas from reference
- POST /api/ai/generate-piece: full piece from approved idea
- POST /api/ai/generate-caption: caption only (evolved from existing)
- POST /api/ai/generate-insights: insights from published metrics"
```

---

## Task 11: Metrics + Insights Modules

**Files:**
- Create: `modules/metrics/queries.ts`
- Create: `modules/metrics/ranking.ts`
- Create: `modules/insights/queries.ts`
- Create: `app/api/metrics/route.ts`
- Create: `app/api/insights/route.ts`
- Create: `app/api/insights/[id]/route.ts`

- [ ] **Step 1: Create modules/metrics/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { Metrics } from "./types";

export async function getMetricsByPieceId(pieceId: string): Promise<Metrics | null> {
  const { data, error } = await supabase()
    .from("metrics")
    .select("*")
    .eq("piece_id", pieceId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertMetrics(
  pieceId: string,
  fields: Omit<Metrics, "id" | "piece_id" | "recorded_at" | "updated_at" | "engagement_rate">
): Promise<Metrics> {
  const engagement_rate = calculateEngagement(fields);

  const { data, error } = await supabase()
    .from("metrics")
    .upsert(
      {
        piece_id: pieceId,
        ...fields,
        engagement_rate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "piece_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listMetricsByAccount(accountId: string): Promise<(Metrics & { piece_title: string })[]> {
  const { data, error } = await supabase()
    .from("metrics")
    .select("*, pieces!inner(title, account_id)")
    .eq("pieces.account_id", accountId)
    .order("engagement_rate", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const pieces = row.pieces as Record<string, string>;
    return {
      ...(row as unknown as Metrics),
      piece_title: pieces.title,
    };
  });
}

function calculateEngagement(m: { likes: number; comments: number; shares: number; saves: number; reach: number }): number {
  if (m.reach === 0) return 0;
  return Number((((m.likes + m.comments + m.shares + m.saves) / m.reach) * 100).toFixed(2));
}
```

- [ ] **Step 2: Create modules/metrics/ranking.ts**

```typescript
import type { Metrics } from "./types";

export interface RankedPiece {
  piece_id: string;
  piece_title: string;
  engagement_rate: number;
  total_interactions: number;
  rank: number;
}

export function rankPieces(
  metricsWithTitles: Array<Metrics & { piece_title: string }>
): RankedPiece[] {
  return metricsWithTitles
    .map((m) => ({
      piece_id: m.piece_id,
      piece_title: m.piece_title,
      engagement_rate: m.engagement_rate,
      total_interactions: m.likes + m.comments + m.shares + m.saves,
      rank: 0,
    }))
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
```

- [ ] **Step 3: Create modules/insights/queries.ts**

```typescript
import { supabase } from "@/lib/supabase";
import type { Insight } from "./types";

export async function listInsights(accountId: string): Promise<Insight[]> {
  const { data, error } = await supabase()
    .from("insights")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createInsight(
  insight: Omit<Insight, "id" | "created_at">
): Promise<Insight> {
  const { data, error } = await supabase()
    .from("insights")
    .insert(insight)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInsight(
  id: string,
  content: string
): Promise<Insight> {
  const { data, error } = await supabase()
    .from("insights")
    .update({ content, is_edited: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 4: Create app/api/metrics/route.ts**

```typescript
import { NextResponse } from "next/server";
import { listMetricsByAccount, upsertMetrics } from "@/modules/metrics/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const metrics = await listMetricsByAccount(accountId);
  return NextResponse.json(metrics);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { piece_id, ...fields } = body;
  if (!piece_id) return NextResponse.json({ error: "piece_id required" }, { status: 400 });

  const metrics = await upsertMetrics(piece_id, fields);
  return NextResponse.json(metrics);
}
```

- [ ] **Step 5: Create app/api/insights/route.ts and app/api/insights/[id]/route.ts**

`app/api/insights/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { listInsights } from "@/modules/insights/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "account_id required" }, { status: 400 });

  const insights = await listInsights(accountId);
  return NextResponse.json(insights);
}
```

`app/api/insights/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { updateInsight } from "@/modules/insights/queries";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content } = await request.json();

  const insight = await updateInsight(id, content);
  return NextResponse.json(insight);
}
```

- [ ] **Step 6: Commit**

```bash
git add modules/metrics/ modules/insights/ app/api/metrics/ app/api/insights/
git commit -m "feat: metrics + insights modules — queries, ranking, API routes

- metrics/queries.ts: getByPieceId, upsert (auto-calculates engagement), listByAccount
- metrics/ranking.ts: rankPieces by engagement rate
- insights/queries.ts: list, create, update (mark as edited)
- API: GET/POST /api/metrics, GET /api/insights, PATCH /api/insights/[id]"
```

---

## Task 12: Upload API Route

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: Create app/api/upload/route.ts**

```typescript
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const accountId = formData.get("account_id") as string;

  if (!file || !accountId) {
    return NextResponse.json({ error: "file and account_id required" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${accountId}/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase()
    .storage
    .from("references")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase()
    .storage
    .from("references")
    .getPublicUrl(fileName);

  return NextResponse.json({ file_url: urlData.publicUrl, file_name: file.name });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/upload/
git commit -m "feat: file upload API — uploads to Supabase Storage

- POST /api/upload: accepts multipart form with file + account_id
- Stores in references/ bucket with account-scoped path
- Returns public URL"
```

---

## Task 13: Restructure App Layout + Root Pages

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `app/contas/page.tsx`
- Create: `app/contas/nova/page.tsx`
- Create: `app/(conta)/[accountId]/layout.tsx`

- [ ] **Step 1: Simplify app/layout.tsx (remove sidebar/topbar — move to account layout)**

Replace the entire content of `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Content OS",
  description: "Plataforma de operacao de conteudo para redes sociais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full">
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update app/page.tsx to redirect to /contas**

Replace:
```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/contas");
}
```

- [ ] **Step 3: Create app/contas/page.tsx**

```tsx
import Link from "next/link";
import { listAccounts } from "@/modules/accounts/queries";

export default async function ContasPage() {
  const accounts = await listAccounts();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold">Contas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione uma conta para gerenciar o conteudo
            </p>
          </div>
          <Link
            href="/contas/nova"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            + Nova conta
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={`/${account.id}/metricas`}
              className="group block rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                {account.avatar_url ? (
                  <img
                    src={account.avatar_url}
                    alt={account.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {account.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="font-heading font-bold group-hover:text-primary transition-colors">
                    {account.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {account.handle} · {account.platform}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create app/contas/nova/page.tsx**

```tsx
import { redirect } from "next/navigation";
import { createAccount } from "@/modules/accounts/queries";

export default function NovaContaPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const platform = (formData.get("platform") as string) || "instagram";

    const account = await createAccount({ name, handle, platform });
    redirect(`/${account.id}/playbook`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-heading font-bold mb-6">Nova Conta</h1>
        <form action={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Nome da marca
            </label>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="GECAPS Brasil"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Handle
            </label>
            <input
              name="handle"
              required
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="@gecapsbrasil"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Plataforma
            </label>
            <select
              name="platform"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Criar conta
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create app/(conta)/[accountId]/layout.tsx**

```tsx
import { notFound } from "next/navigation";
import { getAccountById } from "@/modules/accounts/queries";
import { listAccounts } from "@/modules/accounts/queries";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/mobile-nav";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const account = await getAccountById(accountId);
  if (!account) notFound();

  const accounts = await listAccounts();

  return (
    <>
      <Sidebar accounts={accounts} currentAccountId={accountId} />
      <div className="flex flex-col min-h-full lg:ml-64">
        <Topbar account={account} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav accountId={accountId} />
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/page.tsx app/contas/ "app/(conta)/"
git commit -m "feat: restructure app layout — account-scoped routing

- app/layout.tsx: simplified (no sidebar/topbar — moved to account layout)
- app/page.tsx: redirect to /contas
- app/contas/page.tsx: account list with cards
- app/contas/nova/page.tsx: create account form
- app/(conta)/[accountId]/layout.tsx: sidebar + topbar scoped to account"
```

---

## Task 14: Rewrite Layout Components for Account Context

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/topbar.tsx`
- Modify: `components/layout/mobile-nav.tsx`

- [ ] **Step 1: Rewrite components/layout/sidebar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Kanban,
  Bookmark,
  Lightbulb,
  CheckCircle,
  BookOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./account-switcher";
import type { Account } from "@/modules/accounts/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  separator?: boolean;
}

function getNavItems(accountId: string): NavItem[] {
  const base = `/${accountId}`;
  return [
    { label: "Metricas", href: `${base}/metricas`, icon: BarChart3 },
    { label: "Calendario", href: `${base}/calendario`, icon: Calendar },
    { label: "Pipeline", href: `${base}/pipeline`, icon: Kanban },
    { label: "Referencias", href: `${base}/referencias`, icon: Bookmark, separator: true },
    { label: "Ideias", href: `${base}/ideias`, icon: Lightbulb },
    { label: "Publicados", href: `${base}/publicados`, icon: CheckCircle, separator: true },
    { label: "Playbook", href: `${base}/playbook`, icon: BookOpen, separator: true },
    { label: "Configuracoes", href: `${base}/configuracoes`, icon: Settings },
  ];
}

interface SidebarProps {
  accounts: Account[];
  currentAccountId: string;
}

export function Sidebar({ accounts, currentAccountId }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(currentAccountId);

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-sidebar py-8 px-6 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2">
        <img src="/assets/logo-gecaps.png" alt="GECAPS" className="h-8 dark:hidden" />
        <img src="/assets/logo-gecaps-white.png" alt="GECAPS" className="h-8 hidden dark:block" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
          Social
        </span>
      </div>

      {/* Account switcher */}
      <div className="mt-4 mb-2">
        <AccountSwitcher accounts={accounts} currentId={currentAccountId} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.href}>
              {item.separator && <div className="h-px bg-border my-2" />}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary font-bold bg-card shadow-sm"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="size-[18px]" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Back to accounts */}
      <div className="mt-auto">
        <Link
          href="/contas"
          className="flex items-center gap-3 py-3 px-4 rounded-xl text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Todas as contas
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Rewrite components/layout/topbar.tsx**

```tsx
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import type { Account } from "@/modules/accounts/types";

interface TopbarProps {
  account: Account;
}

export function Topbar({ account }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {account.avatar_url ? (
            <img src={account.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {account.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-heading font-bold">{account.name}</span>
          <span className="text-xs text-muted-foreground">{account.handle}</span>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
```

- [ ] **Step 3: Rewrite components/layout/mobile-nav.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, Kanban, Bookmark, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  accountId: string;
}

export function BottomNav({ accountId }: BottomNavProps) {
  const pathname = usePathname();
  const base = `/${accountId}`;

  const items = [
    { label: "Metricas", href: `${base}/metricas`, icon: BarChart3 },
    { label: "Calendario", href: `${base}/calendario`, icon: Calendar },
    { label: "Pipeline", href: `${base}/pipeline`, icon: Kanban },
    { label: "Refs", href: `${base}/referencias`, icon: Bookmark },
    { label: "Playbook", href: `${base}/playbook`, icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/90 backdrop-blur-lg lg:hidden">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/
git commit -m "feat: rewrite layout components for account-scoped navigation

- sidebar.tsx: 8 nav items matching PRD order, account switcher, back-to-accounts link
- topbar.tsx: shows current account name/handle/avatar
- mobile-nav.tsx: 5 key items for mobile, account-scoped links"
```

---

## Task 15: Account Pages (playbook, config, placeholder pages)

**Files:**
- Create: `app/(conta)/[accountId]/playbook/page.tsx`
- Create: `components/playbook/playbook-form.tsx`
- Create: `app/(conta)/[accountId]/configuracoes/page.tsx`
- Create: `app/(conta)/[accountId]/metricas/page.tsx` (placeholder)
- Create: `app/(conta)/[accountId]/calendario/page.tsx` (placeholder)
- Create: `app/(conta)/[accountId]/pipeline/page.tsx` (placeholder)
- Create: `app/(conta)/[accountId]/referencias/page.tsx` (placeholder)
- Create: `app/(conta)/[accountId]/ideias/page.tsx` (placeholder)
- Create: `app/(conta)/[accountId]/publicados/page.tsx` (placeholder)

- [ ] **Step 1: Create components/playbook/playbook-form.tsx**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import type { BrandPlaybook, PostExample } from "@/modules/playbook/types";

interface PlaybookFormProps {
  accountId: string;
  playbook: BrandPlaybook | null;
}

export function PlaybookForm({ accountId, playbook }: PlaybookFormProps) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [toneOfVoice, setToneOfVoice] = useState(playbook?.tone_of_voice || "");
  const [style, setStyle] = useState(playbook?.style || "");
  const [mandatoryWords, setMandatoryWords] = useState(playbook?.mandatory_words.join(", ") || "");
  const [forbiddenWords, setForbiddenWords] = useState(playbook?.forbidden_words.join(", ") || "");
  const [defaultCta, setDefaultCta] = useState(playbook?.default_cta || "");
  const [doExamples, setDoExamples] = useState(playbook?.do_examples || "");
  const [dontExamples, setDontExamples] = useState(playbook?.dont_examples || "");
  const [extraInstructions, setExtraInstructions] = useState(playbook?.extra_instructions || "");

  async function handleSave() {
    setSaving(true);
    await fetch("/api/playbook", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: accountId,
        tone_of_voice: toneOfVoice || null,
        style: style || null,
        mandatory_words: mandatoryWords.split(",").map((s) => s.trim()).filter(Boolean),
        forbidden_words: forbiddenWords.split(",").map((s) => s.trim()).filter(Boolean),
        default_cta: defaultCta || null,
        do_examples: doExamples || null,
        dont_examples: dontExamples || null,
        extra_instructions: extraInstructions || null,
      }),
    });
    setSaving(false);
    setToast("Playbook salvo!");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tom e Estilo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Tom de voz" value={toneOfVoice} onChange={setToneOfVoice} placeholder="Ex: Profissional mas acessivel, B2B, confiavel" rows={2} />
          <Field label="Estilo editorial" value={style} onChange={setStyle} placeholder="Ex: Direto, sem rodeios, dados quando possivel" rows={2} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vocabulario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Palavras obrigatorias (separar com virgula)" value={mandatoryWords} onChange={setMandatoryWords} placeholder="marca propria, private label, fabricacao" />
          <Field label="Palavras proibidas (separar com virgula)" value={forbiddenWords} onChange={setForbiddenWords} placeholder="barato, generico, copia" />
          <Field label="CTA padrao" value={defaultCta} onChange={setDefaultCta} placeholder="Fale com nosso time comercial" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exemplos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Jeito CERTO de falar" value={doExamples} onChange={setDoExamples} placeholder="Ex: 'Oferecemos solucoes completas em marca propria' — direto, profissional" rows={3} />
          <Field label="Jeito ERRADO de falar" value={dontExamples} onChange={setDontExamples} placeholder="Ex: 'Somos os melhores do mercado!' — vago, arrogante" rows={3} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instrucoes Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Instrucoes adicionais para a IA" value={extraInstructions} onChange={setExtraInstructions} placeholder="Qualquer orientacao adicional que a IA deve seguir..." rows={3} />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
        {saving ? "Salvando..." : "Salvar Playbook"}
      </Button>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-card px-5 py-2.5 text-sm font-semibold shadow-lg border border-border lg:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, rows,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; rows?: number;
}) {
  const Tag = rows && rows > 1 ? "textarea" : "input";
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <Tag
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create app/(conta)/[accountId]/playbook/page.tsx**

```tsx
import { getPlaybookByAccountId } from "@/modules/playbook/queries";
import { PlaybookForm } from "@/components/playbook/playbook-form";

export default async function PlaybookPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const playbook = await getPlaybookByAccountId(accountId);

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-bold">Brand Playbook</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure a identidade da marca. Toda geracao de conteudo por IA segue estas diretrizes.
        </p>
      </div>
      <PlaybookForm accountId={accountId} playbook={playbook} />
    </div>
  );
}
```

- [ ] **Step 3: Create placeholder pages for remaining sections**

Each placeholder follows this pattern — create one file per page:

`app/(conta)/[accountId]/metricas/page.tsx`:
```tsx
export default async function MetricasPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Metricas</h1>
      <p className="text-sm text-muted-foreground">Dashboard de performance — em construcao.</p>
    </div>
  );
}
```

`app/(conta)/[accountId]/calendario/page.tsx`:
```tsx
export default async function CalendarioPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Calendario</h1>
      <p className="text-sm text-muted-foreground">Calendario editorial — em construcao.</p>
    </div>
  );
}
```

`app/(conta)/[accountId]/pipeline/page.tsx`:
```tsx
export default async function PipelinePage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Pipeline</h1>
      <p className="text-sm text-muted-foreground">Kanban de pecas — em construcao.</p>
    </div>
  );
}
```

`app/(conta)/[accountId]/referencias/page.tsx`:
```tsx
export default async function ReferenciasPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Referencias</h1>
      <p className="text-sm text-muted-foreground">Biblioteca de referencias — em construcao.</p>
    </div>
  );
}
```

`app/(conta)/[accountId]/ideias/page.tsx`:
```tsx
export default async function IdeiasPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Ideias</h1>
      <p className="text-sm text-muted-foreground">Banco de ideias — em construcao.</p>
    </div>
  );
}
```

`app/(conta)/[accountId]/publicados/page.tsx`:
```tsx
export default async function PublicadosPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Publicados</h1>
      <p className="text-sm text-muted-foreground">Historico de pecas publicadas — em construcao.</p>
    </div>
  );
}
```

`app/(conta)/[accountId]/configuracoes/page.tsx`:
```tsx
export default async function ConfiguracoesPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-heading font-bold mb-2">Configuracoes</h1>
      <p className="text-sm text-muted-foreground">Configuracoes da conta — em construcao.</p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "app/(conta)/" components/playbook/
git commit -m "feat: account pages — playbook form + placeholder pages

- playbook/page.tsx + playbook-form.tsx: complete brand playbook editor
- metricas, calendario, pipeline, referencias, ideias, publicados, configuracoes: placeholder pages
- All pages account-scoped via [accountId] param"
```

---

## Task 16: Clean Up Legacy Files

**Files:**
- Delete: `lib/types.ts`, `lib/claude.ts`, `lib/trello.ts`, `lib/html-renderer.ts`, `lib/image-generator.ts`
- Delete: `app/api/trello/`, `app/api/posts/`, `app/api/cron/`
- Delete: `app/dashboard/`, `app/calendario/`, `app/configuracoes/`, `app/post/`
- Delete: `components/post/`, `components/dashboard/`

- [ ] **Step 1: Update any remaining imports from lib/types to modules/accounts/types**

Search across the codebase for imports from `@/lib/types`. The main consumers are:
- `components/layout/sidebar.tsx` — already rewritten in Task 14
- `components/layout/account-switcher.tsx` — update import
- `components/calendar/*` — will be rewritten later; for now update import
- `app/api/preview/route.tsx` — uses PILAR_LABELS locally, no import change needed
- `app/api/render/route.ts` — no types import

For `components/layout/account-switcher.tsx`, change the Account import:
```typescript
// Change: import type { Account } from "@/lib/types";
// To:     import type { Account } from "@/modules/accounts/types";
```

- [ ] **Step 2: Delete legacy files**

```bash
rm lib/types.ts lib/claude.ts lib/trello.ts lib/html-renderer.ts lib/image-generator.ts
rm -rf app/api/trello app/api/posts app/api/cron
rm -rf app/dashboard app/calendario app/configuracoes app/post
rm -rf components/post components/dashboard
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build
```

Fix any remaining import errors. The preview route (`app/api/preview/route.tsx`) and render route (`app/api/render/route.ts`) should still work as they don't import from deleted files.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove legacy files — trello, old posts API, flat pages

Removed:
- lib/types.ts, lib/claude.ts, lib/trello.ts, lib/html-renderer.ts, lib/image-generator.ts
- app/api/trello/, app/api/posts/, app/api/cron/
- app/dashboard/, app/calendario/, app/configuracoes/, app/post/
- components/post/, components/dashboard/

All functionality replaced by modules/ + app/(conta)/[accountId]/ structure"
```

---

## Task 17: Remove Legacy Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove unused dependencies**

```bash
npm uninstall puppeteer-core @sparticuz/chromium @sparticuz/chromium-min sharp
```

- [ ] **Step 2: Update next.config.ts to remove chromium externals**

Read `next.config.ts` and remove the `serverExternalPackages` entries for chromium and puppeteer if present. Keep Sentry config and outputFileTracingIncludes for templates.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore: remove legacy deps — puppeteer, chromium, sharp

No longer needed. Image rendering uses Cloudflare Browser Rendering API directly."
```

---

## Task 18: Verify Full Build + Smoke Test

- [ ] **Step 1: Run build**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

- [ ] **Step 3: Smoke test in browser**

Open `http://localhost:3000`. Verify:
1. Redirects to `/contas`
2. Shows account list (existing accounts from migrated data)
3. Click an account — navigates to `/{accountId}/metricas`
4. Sidebar shows all 8 nav items
5. Navigate to Playbook — form loads
6. Navigate to each placeholder page — no errors
7. Preview API still works: `/api/preview?title=Test&layout=branco&w=540`
8. Render API still works: `/api/render?template=branco&title=Test`

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from restructuring"
```

---

## Summary

| Task | Description | Files | Dependencies |
|------|-------------|-------|-------------|
| 1 | Database Migration | SQL migration | None |
| 2 | Module Types | 7 type files | None |
| 3 | Accounts Module | queries, actions, API | Task 2 |
| 4 | Playbook Module | queries, actions, prompt-builder, API | Task 2 |
| 5 | Status Machine | status-machine.ts | Task 2 |
| 6 | Pieces Module | queries, actions, API | Tasks 2, 5 |
| 7 | References Module | queries, extractor, actions, API | Task 2 |
| 8 | Ideas Module | queries, actions, API | Task 2 |
| 9 | AI Module | client, prompts, pipeline | Tasks 4, 7, 8 |
| 10 | AI API Routes | 5 API routes | Task 9 |
| 11 | Metrics + Insights | queries, ranking, API | Task 2 |
| 12 | Upload API | upload route | None |
| 13 | Restructure Layout | root layout, contas, account layout | Task 3 |
| 14 | Layout Components | sidebar, topbar, mobile-nav | Task 2 |
| 15 | Account Pages | playbook form + placeholders | Tasks 4, 13 |
| 16 | Clean Up Legacy | delete old files | Tasks 13, 14 |
| 17 | Remove Legacy Deps | uninstall packages | Task 16 |
| 18 | Verify Build | smoke test | All |
