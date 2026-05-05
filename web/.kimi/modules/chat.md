# Módulo: Chat (`src/features/chat/`)

## O que faz
Área principal de interação com o agente Kimi. Inclui lista de mensagens, input, aprovações, perguntas, painel de arquivos, busca, fila e todo list.

## Componentes principais

### ChatWorkspace (`chat.tsx`)
- Combina header + conversation + approval dialog + question dialog + prompt composer + files panel
- Gerencia pendingApprovalMap e pendingQuestionMap
- Memoizado

### ChatWorkspaceContainer (`chat-workspace-container.tsx`)
- Conecta ChatWorkspace ao useSessionStream (WebSocket)
- Gerencia file uploads, message queue, plan mode, auto-send, fork
- Atalho Shift+Cmd/Ctrl+O para nova sessão

### ChatConversation (`chat-conversation.tsx`)
- Estados vazios: loading, no session, new session prompt
- Botão scroll-to-bottom
- Integração com MessageSearchDialog
- Handler Cmd+F
- **Memoizado** (fix recente)

### VirtualizedMessageList (`components/virtualized-message-list.tsx`)
- react-virtuoso para virtualização
- MessageBubble com avatar (user/assistant)
- Ações no hover: copy, bookmark, fork
- Attachments

### AssistantMessage (`components/assistant-message.tsx`)
- Variants: text, chain-of-thought, tool, code, thinking
- Tool messages: approval UI, subagent steps, media previews
- **Memoizado** (fix recente)

### ChatPromptComposer (`components/chat-prompt-composer.tsx`)
- PromptInput de @ai-elements
- File attachments, slash commands, file mentions
- Expand/collapse, draft auto-save
- Global config controls (model, thinking, plan mode)
- Prompt toolbar (queue, changes, todo, context usage)

### ApprovalDialog (`components/approval-dialog.tsx`)
- Full-screen bottom panel
- Approve (1), Approve for session (2), Decline (3), Decline with feedback (4)
- Atalhos de teclado

### QuestionDialog (`components/question-dialog.tsx`)
- Substitui composer quando há pergunta pendente
- Multi-question tabs, single/multi-select, "Other" free-text
- Navegação por teclado

### SessionFilesPanel (`components/session-files-panel.tsx`)
- Navegação de diretórios do workspace
- Download, refresh, breadcrumb

## Features adicionais

- **MessageSearchDialog**: Cmd+F, busca em todas as mensagens com preview
- **FileMentions**: `@` para mencionar arquivos do workspace
- **SlashCommands**: `/` para comandos rápidos
- **QueueStore**: fila de mensagens quando IA está ocupada
- **Toolbar**: queue, git diff changes, todo items, context usage
