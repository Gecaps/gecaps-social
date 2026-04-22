# Social Content OS — Painel útil para Aline criar conteúdo

**Data:** 2026-04-21
**Autor:** Felipe + Claude (brainstorming)
**Status:** Design aprovado, aguardando revisão antes do plano de implementação
**Contexto:** Social Content OS está em produção em https://social.gecaps.com.br com 9 telas, Studio Criativo v1 e pipeline IA. A Aline (social media da GECAPS) **ainda não usa o painel** — hoje opera via Trello + bot n8n Telegram. Este documento descreve o redesign do fluxo principal para que a Aline consiga abrir o painel, criar conteúdo de forma produtiva e abandonar o workflow legado.

---

## 1. Problema

O painel atual foi construído com um pipeline de 3 estágios (Referência → Ideia → Peça) pensado como ferramenta interna de produção. A Aline:

- Não sabe que o painel existe (onboarding zero)
- Mesmo se soubesse, o pipeline atual é denso demais para a forma como ela trabalha (ela pensa a semana em termos de **calendário**, não de pipeline)
- O valor de "produção" do painel é alto, mas o de **criação assistida** (ajudar a sair do branco, garantir voz de marca, reaproveitar o que funciona) é baixo
- Publicação é manual no Instagram e o painel não fecha o ciclo

O redesign precisa entregar um painel que seja **primariamente uma ferramenta de criação de conteúdo**, com calendário como ponto de partida, fluxo híbrido "eu escrevo ou IA sugere", e kit de publicação claro. Medição de métricas é secundária e fica para depois.

## 2. Fluxo-alvo da Aline

```
Segunda de manhã, Aline abre o painel
  ↓
[HOME] Calendário da semana
  - vê o que já tá agendado/publicado
  - vê buracos (dias sem post)
  - vê fila de sugestões da IA pra preencher
  ↓
[CRIAR] Clica num dia vazio OU puxa uma sugestão
  - escolhe: escrevo eu OU pega sugestão IA
  - edita no Studio Criativo (template, foto Pexels, Nano Banana, carrossel)
  - "não gostei da imagem" → regenera
  ↓
[KIT] Peça pronta — página de publicação mobile-first
  - imagem HD (botão Baixar)
  - legenda, hashtags, primeiro comentário, ideia de Stories (todos com botão Copiar)
  ↓
[POSTAR] Ela posta no Instagram pelo celular
  ↓
[CONFIRMAR] Cola URL do post no painel, marca como Publicado
  ↓
[REMIX] Post publicado vira matéria-prima pra próximas variações
```

## 3. Decisões tomadas

### 3.1 O que é desligado do legado

- **Bot Telegram "Aline aprova/rejeita"** (workflow n8n `otDEgPhVub3mJdnB`) — substituído por Pipeline do painel com botões Aprovar/Rejeitar
- **Cron 7h Trello → Claude → Telegram** (workflow n8n `KUrxCMPe8VBpdSYb`) — substituído pelo Calendário do painel
- **Trello board da Aline** — arquivado. Textos/copy passam a morar em `social_pieces` (tabela Supabase existente)

### 3.2 Calendário como home (Seção 2 do brainstorming)

Rota `/{accountId}/calendario` vira a home da Aline. Redirecionamento de `/` pra `/calendario` da conta ativa.

**Layout:**
- Semana atual, 7 colunas (seg-dom), scroll horizontal pra navegar semanas
- Cada dia mostra peças como cards compactos (miniatura + título + status colorido)
- Dias vazios com "+" pra criar ali
- Barra superior: **Criar post**, **Ver sugestões IA** (badge com nº), **Importar referência**
- Drawer lateral direito: fila de sugestões IA (arrastar pra dia OU clicar pra expandir/editar)

**Cores de status no card:**
- Cinza = rascunho/ideia
- Amarelo = em produção
- Verde = aprovado/agendado
- Azul = publicado

### 3.3 Criar post híbrido (Seção 3)

Wizard de 3 passos:

1. **Como começar?** — "Eu escrevo" (editor vazio) ou "IA sugere" (5 ideias geradas pelo Claude com contexto de playbook + pilares + posts recentes)
2. **Editor** — é o atual (título, hook, legenda, CTA, hashtags, layout, imagem Pexels/Nano Banana, carrossel, preview ao vivo)
3. **Agendar** — dia/horário, default no próximo dia vazio; pode ficar como rascunho

**Mudança no pipeline:** colapsa 3 etapas (Referência → Ideia → Peça) em 2 (Ideia → Peça). Referências viram fonte de inspiração opcional, acessadas dentro do editor como sidebar, não como etapa obrigatória.

### 3.4 Kit de publicação (Seção 4)

Botão **"Pronto pra postar"** aparece quando peça está `final_approved` ou `scheduled`. Abre tela dedicada mobile-first:

```
┌─────────────────────────────┐
│  [Imagem HD em tamanho real]│  (swipe para carrossel)
│                             │
│  [⬇ Baixar imagem]          │  (PNG ou ZIP de carrossel)
│  [✨ Não gostei, regenerar] │  (volta pro editor)
├─────────────────────────────┤
│  📝 LEGENDA      [📋 Copiar] │
├─────────────────────────────┤
│  # HASHTAGS      [📋 Copiar] │
├─────────────────────────────┤
│  💬 PRIMEIRO COMENTÁRIO      │
│                  [📋 Copiar] │
├─────────────────────────────┤
│  📱 IDEIA PRO STORIES        │
│                  [📋 Copiar] │
├─────────────────────────────┤
│  ✅ JÁ POSTEI                │
│  [Cole aqui o link do post]  │
│  [Marcar como Publicado]     │
└─────────────────────────────┘
```

**Geração do kit:** primeiro comentário e ideia de Stories são gerados sob demanda via Claude (1 chamada retornando ambos), salvos em `social_pieces` pra não regenerar a cada abertura.

**Marcar Publicado:** ao colar URL e confirmar, status vai pra `published`, URL salva em `social_metrics.post_url`. Job de métricas fica pendente até a integração Instagram Graph API ser construída (fora desta entrega).

### 3.5 Funções que tornam o painel útil pra criar conteúdo (Seção 5)

Seis funções, priorização **1 → 4 → 3 → 2 → 5 → 6**:

1. **Banco de ideias por pilar** — gaveta com 20-30 hooks prontos por pilar (os 6 existentes: educativo, autoridade, produto, conexão, social-proof, objeção). Clique no hook → editor pré-preenchido.
2. **Voz da marca travada** — regras no playbook da conta (sem travessão, sem "descubra", handle correto). Após qualquer geração de IA (legenda, hook, primeiro comentário, stories), painel valida contra as regras e marca violações em vermelho com tooltip explicativo. **Aviso, não bloqueio** — Aline pode publicar mesmo com aviso, decisão é dela.
3. **Catálogo de produtos GECAPS** — 10-15 SKUs (colágeno, ômega, multivitamínico, etc). Ela escolhe produto → Claude gera post focado naquele produto. Puxa do playbook regulatório para respeitar claims permitidas.
4. **Remix de post antigo** — na aba Publicados, botão "Criar variação" roda Claude com o post como contexto e gera 3 ângulos diferentes; ela escolhe qual virar peça nova.
5. **Datas comerciais** — calendário injeta contexto (Dia das Mães, Black Friday etc) na sugestão da IA automaticamente.
6. **Biblioteca de frases campeãs** — painel guarda hooks/CTAs/legendas que performaram bem quando ela marca posts como "rolou bem". Banco pra remix futuro.

**Racional da priorização:** itens 1 e 4 entregam utilidade na primeira semana sem depender de histórico. Itens 2, 3, 5, 6 ficam mais potentes com dados acumulados.

### 3.6 Onboarding (Seção 6)

Primeira visita da Aline cai num fluxo guiado de 3 telas antes da home:

1. **Boas-vindas (10s)** — "Oi Aline! Esse é o painel novo. Vou te mostrar em 3 passos." + botão "Bora"
2. **Tour do calendário** — overlay com 4 balões clicáveis (semana → Criar post → sugestões IA → Configurações)
3. **Primeira ação obrigatória** — "Cria seu primeiro post agora, pode ser um teste" → abre o wizard

Depois disso o tour some. Botão "Ver tour de novo" nas Configurações.

**Persistência:** como ainda não há auth de usuário, o estado do tour fica em `localStorage` no navegador da Aline. Quando Supabase Auth entrar, migra pra coluna em `users`. A coluna `social_accounts.tour_completed_at` listada em §5 fica como referência operacional global ("essa conta já viu o tour pela primeira vez por algum usuário"), não como fonte de verdade por usuário.

**Acesso/login:** painel permanece aberto (sem login) pra reduzir fricção na validação. Quando ampliar o time, adiciona Supabase Auth com magic link no email (fora desta entrega).

## 4. Escopo desta entrega

### Dentro
- Rota `/` e `/{accountId}` redirecionam pra calendário
- Calendário redesenhado com cards por dia, drawer de sugestões IA, barra de ações
- Wizard de 3 passos (Como começar → Editor existente → Agendar)
- Colapso do pipeline pra 2 etapas (Ideia → Peça)
- Tela "Kit de publicação" com download, copy buttons, marcar publicado, não-gostei-regenerar
- Função 1 (Banco de ideias por pilar) e Função 4 (Voz da marca travada)
- Onboarding de 3 telas
- **Desabilitar** (não deletar) workflows n8n `otDEgPhVub3mJdnB` e `KUrxCMPe8VBpdSYb`; ficam como rede de segurança por 2-3 semanas após Aline confirmar adoção do painel, depois deletar. Trello board é arquivado (não deletado) com nota apontando pro painel.
- Comunicação da Aline (Telegram manual pelo Felipe)

### Fora
- Instagram Graph API (métricas automáticas) — entrega posterior
- Funções 3, 2, 5, 6 (catálogo de produtos, remix, datas comerciais, biblioteca de frases) — próximas rodadas, ordem já definida
- Supabase Auth / magic link — quando ampliar time
- Métricas reais em dashboard — só URL do post é guardada por enquanto

## 5. Mudanças de dados

**Tabelas existentes, colunas novas:**
- `social_accounts.tour_completed_at` (timestamp, nullable) — marca se a conta já passou pelo onboarding
- `social_pieces.first_comment` (text, nullable) — primeiro comentário gerado pelo kit
- `social_pieces.stories_idea` (text, nullable) — ideia de Stories gerada pelo kit
- `social_metrics.post_url` (text, nullable) — URL do post no Instagram após publicação

**Tabelas novas:**
- `social_idea_bank` — hooks prontos por pilar (colunas: `id`, `pilar`, `hook`, `description`, `active`)

**Playbook:**
- Campo `voice_rules` (jsonb) em `social_brand_playbooks` — lista de regras ("sem travessão", "handle @gecapsbrasil", etc) que o Claude vai validar após geração.

## 6. Ordem de implementação sugerida

1. **Base de dados** — migrations (colunas novas + `social_idea_bank` + seed inicial de hooks)
2. **Redirect de home** pra `/calendario`
3. **Calendário redesenhado** (layout semanal + drawer de sugestões)
4. **Wizard de criar post** (3 passos)
5. **Colapso pipeline 3→2 etapas** (Ideia → Peça)
6. **Kit de publicação** (tela mobile-first + geração sob demanda)
7. **Banco de ideias por pilar** (Função 1)
8. **Voz da marca travada** (Função 4)
9. **Onboarding 3 telas**
10. **Desligamento do legado** (n8n + Trello)
11. **Comunicação Aline** (pelo Felipe)

Cada passo é implementável em ordem sem bloquear o próximo. Passos 1-6 são o MVP funcional; 7-8 aumentam a utilidade; 9 fecha a experiência; 10-11 finalizam a migração.
