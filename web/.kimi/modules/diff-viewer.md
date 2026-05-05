# Módulo: Diff Viewer (`src/components/ui/diff/`)

## O que faz
Renderizador de diff com syntax highlighting.

## Arquivos
- `index.tsx`: diff table completo com refractor
- `lazy.tsx`: lazy load wrapper
- `utils/parse.ts`: parse de git diff, merge de linhas modificadas, inline char diffs
- `utils/guess-lang.ts`: mapping de 50+ extensões para linguagens

## Uso
Usado em `DisplayContent` para mostrar diffs de tool calls (WriteFile).
