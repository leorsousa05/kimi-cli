# Módulo: Sessions (`src/features/sessions/`)

## O que faz
Sidebar de sessões. Lista, cria, organiza e gerencia sessões de coding.

## Componentes principais

### SessionsSidebar (`sessions.tsx`)
- **Memoizado** (SessionsSidebarComponent)
- Kimi brand, refresh, new session button
- Search input com debounce
- Toggle list/grouped view
- Session list com context menus (right-click)
- Archived sessions (collapsible)
- Multi-select mode com bulk archive/unarchive/delete
- Pin support via sessionTags
- Rename inline editing
- Load more pagination
- **Self-time foi de 49ms → 8ms após fixes**

### CreateSessionDialog (`create-session-dialog.tsx`)
- Command dialog para criar sessões
- Diretório atual, recentes, custom path com tab completion
- Confirmação para diretório inexistente

## Hooks relacionados

- **useSessions**: CRUD completo de sessões, paginação, search, archive
- **useSessionTags**: pins e tags no localStorage
