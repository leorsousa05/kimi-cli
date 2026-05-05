# Módulo: Tool Display (`src/features/tool/`)

## O que faz
Renderiza resultados de tool calls de forma rica.

## Store (`store.ts`)
- Zustand store
- Tracks `newFiles` (de WriteFile) e `todoItems` (de SetTodoList)
- `handleToolResult()` parseia resultados

## DisplayContent (`components/display-content.tsx`)
- Web search results
- Image search by text / by image (Google Lens)
- Diff display (structuredPatch + inline diff viewer)
- JSON, plain text, base64 images
- MCP resources (images, text, generic)
