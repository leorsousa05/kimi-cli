# Testes — Kimi CLI Web UI

## Comandos

```bash
npm run typecheck   # tsc -b --noEmit
npm run lint        # biome check .
npm run lint:fix    # biome check --write .
```

## Notas

- Não há testes unitários ou e2e no frontend
- Validação é via TypeScript + Biome
- Build deve passar sem erros: `npm run build`
