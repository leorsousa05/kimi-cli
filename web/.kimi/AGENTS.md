# Kimi CLI Web UI — Visão Geral

Interface web do Kimi Code CLI. React + Vite + Tailwind CSS 4 + shadcn/ui.

## Tech Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 4.1.17 com `@tailwindcss/vite`
- shadcn/ui (Radix + Tailwind)
- react-virtuoso (virtualização de listas)
- streamdown (renderização de markdown streaming)
- refractor (syntax highlighting)
- Sonner (toasts)

## Como rodar

```bash
cd web
npm run dev      # dev server Vite
npm run build    # build produção
npm run typecheck
npm run lint
```

## Estrutura de diretórios

| Diretório | Conteúdo |
|-----------|----------|
| `src/App.tsx` | Root: layout resizable, sidebar + chat, command palette, atalhos |
| `src/components/ui/` | 30+ componentes shadcn/ui (button, dialog, diff, kbd, etc.) |
| `src/components/ai-elements/` | Primitivas de chat: message, code-block, tool, reasoning, prompt-input, etc. |
| `src/features/chat/` | Chat completo: workspace, conversation, composer, approvals, questions, files panel, search, queue/todo |
| `src/features/sessions/` | Sidebar de sessões: lista, create dialog, pins, archive, bulk ops |
| `src/features/tool/` | Display de tool results: diff, imagens, web search, MCP resources |
| `src/hooks/` | useSessions, useSessionStream (WebSocket), useBookmarks, useSessionTags, useGlobalConfig, etc. |
| `src/lib/api/` | Cliente OpenAPI gerado |

## Entry points

- `src/main.tsx` → monta React
- `src/App.tsx` → root component
- `src/bootstrap.tsx` → inicialização

## Convenções

- Componentes shadcn em `src/components/ui/`
- Features em `src/features/<feature>/`
- Hooks compartilhados em `src/hooks/`
- API client em `src/lib/api/`
- Tailwind 4: `@import "tailwindcss"` no `index.css`
- Biome para lint/format (não ESLint/Prettier)
