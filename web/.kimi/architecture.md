# Arquitetura da Web UI

## Visão Geral da Arquitetura

A Web UI do Kimi Code CLI segue uma arquitetura de **SPA (Single Page Application)** com comunicação bidirecional em tempo real via WebSocket. O padrão arquitetural predominante é **Container/Presentational** combinado com **Feature-Based Organization**.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Sidebar   │  │   Chat      │  │   Command Palette   │  │
│  │  (Sessions) │  │  (Workspace)│  │   (Global Actions)  │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                   │
│  ┌──────┴────────────────┴──────────────────────────────┐   │
│  │              React Hooks (Data Layer)                 │   │
│  │  useSessions() │ useSessionStream() │ useGlobalConfig()│   │
│  └──────┬────────────────┬──────────────────────────────┘   │
│         │                │                                   │
│  ┌──────┴──────┐  ┌──────┴──────┐                          │
│  │  REST API   │  │  WebSocket  │                          │
│  │  (OpenAPI)  │  │  (Wire)     │                          │
│  └──────┬──────┘  └──────┬──────┘                          │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          └────────────────┘
                   │
          ┌────────┴────────┐
          │  Kimi CLI Backend│
          │  (Python/FastAPI)│
          └─────────────────┘
```

## Camadas da Aplicação

### 1. Entry Layer (`main.tsx`, `bootstrap.tsx`)

- **`main.tsx`**: Entry point puro. Monta `<App />` no DOM com `StrictMode`.
- **`bootstrap.tsx`**: Inicialização da aplicação:
  1. Resolve token JWT (localStorage → URL param `?token=`)
  2. Configura API client com header `Authorization: Bearer {token}`
  3. Aplica tema inicial (antes de renderizar para evitar flash)
  4. Monta `<App />`

### 2. App Layer (`App.tsx`)

Componente raiz que coordena o layout global e o estado de alto nível:

- **Layout responsivo**: `ResizablePanelGroup` com sidebar redimensionável (48px collapsed, 260px default)
- **Mobile**: Sidebar como drawer em telas < 1024px
- **URL sync**: `getSessionIdFromUrl()` / `updateUrlWithSession()` — sincroniza URL com sessão ativa
- **State coordination**: 
  - `useSessions()` — CRUD de sessões
  - `useCommandPalette()` / `useShortcutsDialog()` — modais globais
  - `useSessionTags()` / `useBookmarks()` — persistência local (localStorage)
- **Keyboard shortcuts globais**: `Ctrl/Cmd+K` (command palette), `?` (shortcuts dialog)

### 3. Feature Layer (`src/features/`)

Cada feature é um domínio de negócio autocontido:

#### 3.1 Chat Feature (`src/features/chat/`)

O feature mais complexo, composto por:

- **`chat.tsx`** (Presentational): Recebe props de estado e callbacks, renderiza:
  - `ChatWorkspaceHeader` — título, ações, search
  - `ChatConversation` — área de mensagens
  - `ChatPromptComposer` — input de prompt
  - `ApprovalDialog` — aprovações pendentes
  - `QuestionDialog` — perguntas do backend
  - `SessionFilesPanel` — navegação de arquivos

- **`chat-workspace-container.tsx`** (Container):
  - Isola atualizações de alta frequência do `useSessionStream`
  - Gerencia upload de arquivos (converte blob URLs → Files)
  - Integra fila de mensagens (`useQueueStore`)
  - Gera título automaticamente após primeiro turno

- **`useSessionStream.ts`** (Data Hook — ~2900 linhas):
  - Conecta ao WebSocket da sessão selecionada
  - Processa eventos JSON-RPC do backend
  - Transforma eventos em `LiveMessage[]`
  - Gerencia aprovações, perguntas, subagentes
  - Usa refs para acumuladores de streaming (evita re-renders)
  - WebSocket identity guards previnem vazamento entre sessões

#### 3.2 Sessions Feature (`src/features/sessions/`)

- **`sessions.tsx`**: Sidebar de sessões com:
  - Lista virtualizada (`react-virtuoso`)
  - Busca por título e workDir
  - Agrupamento por diretório (view "grouped")
  - Multi-seleção com ações em lote
  - Menu de contexto customizado
  - Inline editing de título

- **`create-session-dialog.tsx`**: Diálogo de criação de nova sessão

#### 3.3 Tool Feature (`src/features/tool/`)

- **`store.ts`**: Zustand store para eventos de ferramentas:
  - `newFiles` — arquivos criados por ferramentas
  - `todoItems` — itens de todo
- **`display-content.tsx`**: Renderização de conteúdo display de ferramentas (diffs, buscas, recursos MCP)

### 4. Component Layer (`src/components/`)

#### 4.1 UI Components (`src/components/ui/`)

30+ componentes base do shadcn/ui (estilo "new-york"):
- Baseados em Radix UI (primitives acessíveis)
- Estilização com `class-variance-authority` (CVA)
- Tokens CSS do design system
- Componentes customizados: `input-group`, `message-bubble`, `shortcuts-dialog`, `theme-toggle`, `typing-indicator`

#### 4.2 AI Elements (`src/components/ai-elements/`)

Componentes especializados para interfaces de AI, registrados no registry `@ai-elements`:

| Componente | Responsabilidade |
|-----------|------------------|
| `prompt-input.tsx` | Input de prompt com anexos (drag-drop, validação, blob→data URL) |
| `message.tsx` | Bubbles de mensagem, ações (copy, fork), anexos, branches |
| `tool.tsx` | Renderização de tool calls (header, input, output, media preview) |
| `streamdown.tsx` | Configuração do renderizador markdown (plugins seguros, anti-XSS) |
| `code-block.tsx` | Syntax highlighting via Shiki (temas light/dark, LRU cache) |
| `subagent-steps.tsx` | Atividade de subagentes com passos acumulados |
| `reasoning.tsx` | Conteúdo de thinking com auto-open/close |
| `chain-of-thought.tsx` | Componente Chain of Thought com timeline |
| `confirmation.tsx` | Componente de confirmação/approval (estados condicionais) |
| `conversation.tsx` | Wrapper `StickToBottom` para scroll automático |
| `model-selector.tsx` | Seletor de modelo com busca |
| `shimmer.tsx` | Efeito de shimmer em texto |
| `loader.tsx` | Ícone de loader animado (SVG custom) |

### 5. Hooks Layer (`src/hooks/`)

Hooks customizados que encapsulam lógica de negócio e comunicação:

| Hook | Responsabilidade |
|------|------------------|
| `useSessions.ts` | CRUD de sessões, paginação, busca, arquivos (~1100 linhas) |
| `useSessionStream.ts` | WebSocket + reducer de eventos wire (~2900 linhas) |
| `useGlobalConfig.ts` | Configuração global (modelo, thinking, plan mode) |
| `useFileMentions.ts` | Autocomplete de arquivos com `@` (~541 linhas) |
| `useSlashCommands.ts` | Autocomplete de comandos com `/` (~303 linhas) |
| `useBookmarks.ts` | Bookmarks de mensagens (localStorage) |
| `useSessionTags.ts` | Tags de sessões (localStorage) |
| `useDraftStore.ts` | Rascunhos por sessão (localStorage) |
| `use-theme.ts` | Tema light/dark com View Transitions API (~187 linhas) |

### 6. Lib Layer (`src/lib/`)

- **`utils.ts`**: `cn()` (clsx + tailwind-merge), `shortenTitle()`
- **`apiClient.ts`**: Configuração base do fetch (base URL, headers)
- **`auth.ts`**: JWT auth (localStorage com expiração 24h, fallback URL param)
- **`version.ts`**: Versão da aplicação
- **`api/`**: Cliente OpenAPI gerado automaticamente

## Fluxo de Dados

### Inicialização

```
bootstrap.tsx
  ├── resolve token (localStorage → URL)
  ├── configure API client
  ├── apply theme (evita flash)
  └── render <App />
      ├── useSessions() → fetch sessions
      ├── useGlobalConfig() → fetch config
      └── ChatWorkspaceContainer
          └── useSessionStream() → connect WebSocket
```

### Envio de Mensagem

```
User → ChatPromptComposer
  ├── PromptInput (anexos, texto)
  ├── handlePromptSubmit()
  │   ├── uploadFilesToSession() (se anexos)
  │   ├── queue se streaming
  │   └── sendMessage() → WebSocket
  └── Backend processa → eventos wire
      └── useSessionStream.processEvent()
          └── atualiza LiveMessage[]
              └── re-render ChatConversation
```

### Recebimento de Evento Wire

```
WebSocket onmessage
  ├── identity guard (wsRef.current !== ws)
  ├── parseWireMessages() (JSONL)
  ├── extractEvent()
  └── processEvent(event)
      ├── TurnBegin → nova mensagem
      ├── ContentPart → append texto
      ├── ToolCall → nova tool call
      ├── ToolResult → atualiza resultado
      ├── ApprovalRequest → pending approval
      ├── QuestionRequest → pending question
      ├── SubagentEvent → acumula steps
      └── ... outros eventos
```

## Padrões Arquiteturais

### Container/Presentational

- **Containers**: `ChatWorkspaceContainer`, `App`
  - Conectam a hooks de dados
  - Gerenciam side effects
  - Passam dados e callbacks como props
- **Presentational**: `ChatWorkspace`, `ChatConversation`, `VirtualizedMessageList`
  - Recebem props
  - Renderizam UI
  - Não têm conhecimento de fonte de dados

### Feature-Based Organization

Cada feature em `src/features/<feature>/` contém:
- Componentes específicos do domínio
- Hooks específicos do domínio
- Stores (Zustand) específicos do domínio
- Utilitários específicos do domínio

### Compound Components

Vários componentes de `@ai-elements` usam o padrão compound:
- `PromptInput` + `PromptInputBody` + `PromptInputFooter` + `PromptInputTextarea` + ...
- `ChainOfThought` + `ChainOfThoughtHeader` + `ChainOfThoughtStep` + ...
- `Message` + `MessageContent` + `MessageActions` + `MessageAttachment` + ...

### Provider Pattern

- `PromptInputProvider` — eleva estado do input fora do componente
- Contextos internos: `ChainOfThoughtContext`, `ConfirmationContext`

### Ref Pattern para Performance

- `useSessionStream` usa refs para acumuladores de streaming:
  - `currentThinkingRef` — texto de thinking em progresso
  - `currentTextRef` — texto em progresso
  - `currentToolCallsRef` — tool calls em progresso
- Isso evita re-renders a cada chunk recebido do WebSocket

## Decisões Arquiteturais Importantes

### 1. WebSocket como Fonte Primária de Eventos

O backend envia **todos** os eventos de streaming via WebSocket, não via REST. Isso inclui:
- Chunks de texto
- Tool calls e resultados
- Aprovações e perguntas
- Eventos de subagentes

**Vantagem**: Latência mínima, streaming nativo.
**Desvantagem**: Complexidade no gerenciamento de estado (motiva o uso de refs).

### 2. LiveMessage como Modelo Unificado

Todas as mensagens (usuário, assistente, tool calls, thinking, status) são normalizadas para `LiveMessage`:

```typescript
type LiveMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  variant?: "text" | "chain-of-thought" | "tool" | "code" | "thinking" | "message-id" | "status";
  thinking?: string;
  toolCall?: { /* ... */ };
  attachments?: MessageAttachmentPart[];
  isStreaming?: boolean;
  // ...
};
```

**Vantagem**: Interface uniforme para a lista virtualizada.
**Desvantagem**: Tipo complexo, alguns campos são opcionais por design.

### 3. Virtualização com react-virtuoso

A lista de mensagens usa `react-virtuoso` para virtualização:
- Apenas mensagens visíveis são renderizadas no DOM
- `followOutput` inteligente: auto-scroll se próximo do bottom (gap <= 1500px)
- `computeItemKey` usa `message.id` para estabilidade

### 4. Cache LRU para Syntax Highlighting

`CodeBlock` usa cache LRU (`HIGHLIGHT_CACHE_LIMIT = 50`) para evitar re-highlighting:
- Chave do cache: `language + "::" + code`
- Shiki é carregado dinamicamente (lazy)
- HTML gerado para ambos os temas (light/dark)

### 5. Escape de HTML para Anti-XSS

`Streamdown` (renderizador markdown) escapa HTML fora de code blocks:
- Usa `＜` e `＞` (fullwidth) para manter aparência sem ser parseado
- Preserva code blocks, inline code, e math
- Plugins rehype/remark são curados (apenas `katex`, `gfm`, `math`)

## Integração com Backend

### REST API (OpenAPI)

Endpoints consumidos:
- `GET /api/sessions/` — listar sessões
- `POST /api/sessions/` — criar sessão
- `PATCH /api/sessions/{id}` — renomear sessão
- `DELETE /api/sessions/{id}` — deletar sessão
- `POST /api/sessions/{id}/fork` — fork de sessão
- `POST /api/sessions/{id}/files` — upload de arquivo
- `GET /api/sessions/{id}/files` — listar diretório
- `GET /api/config/` — configuração global
- `PATCH /api/config/` — atualizar configuração
- `POST /api/open-in/` — abrir em aplicativo externo

### WebSocket (Wire Protocol)

Conexão: `wss://host/wire/{session_id}`

Mensagens JSON-RPC 2.0:
```json
{
  "jsonrpc": "2.0",
  "method": "event",
  "params": {
    "type": "ContentPart",
    "payload": { "content": "chunk de texto" }
  }
}
```

## Segurança

- **JWT**: Token em `localStorage` com expiração de 24h
- **XSS Prevention**: Escape de HTML no markdown, plugins curados
- **CSP**: Dependente da configuração do backend
- **Error Boundary**: `ErrorBoundary` no root para capturar erros de renderização
