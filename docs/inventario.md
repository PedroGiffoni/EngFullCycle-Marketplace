# Inventário inicial — Projeto A

Inspeção em 11/11/2026: somente `.agents/skills/`, `LEIA_PRIMEIRO.md` e `PROMPT_INICIAL.md`. Sem repositório Git, README, código, Compose, workflows, testes ou entregas anteriores neste diretório. Nenhuma stack preexistente identificada. Nove skills lidas integralmente. Adotada a sugestão TypeScript + Fastify + PostgreSQL + Redis. Autores e divisão de módulos pendentes de identificação verificável.

Fonte: [enunciado](https://henriquelopeslima.github.io/diglass/aulas/24-projeto-final.html), cópia real em [evidencias/enunciado.html](evidencias/enunciado.html). Obtida via PowerShell após falha de DNS no sandbox. Rubrica confirmada: M1 35, M2 20, M3 15, M4 30. Entrega até 13/11; apresentação opcional em 16/11 ou vídeo até 13/11. Confirmar o ano com o docente; a página não o informa nas datas.

Situação inicial de todas as linhas: ausente. A matriz final e as evidências de execução ficam em `docs/entrega.md`. Não confundir código implementado com verificação executada.

| Critério | Peso do módulo | Evidência planejada | Reprodução |
|---|---:|---|---|
| Monólito, SOLID, Strategy, Repository | M1 35 | src/modules, docs/adr/0001-decisao.md | npm run lint; npm run test:integration |
| Compose e 100 mil pedidos idempotentes | M1 35 | docker-compose.yml, scripts/seed.ts | docker compose up --build; npm run seed; npm run verify:seed |
| Domínio, PostgreSQL, contrato e coverage | M2 20 | tests, coverage | npm run coverage |
| CI e SCA | M2/M3 | .github/workflows/ci.yml | npm ci; npm audit --audit-level=high |
| Ambientes, RED, trace, SLO, flag e deploy | M3 15 | docs/operacao.md | npm run test:ops |
| ADR, C4, OpenAPI | M4 30 | docs/adr, docs/c4, docs/openapi.yaml | npm run lint:api |
| Cache, fila idempotente, k6 antes/depois | M4 30 | docs/desempenho.md, load | comandos em docs/desempenho.md |
| Marca, motion e Three | experiência | docs/marca.md, web | npm run test:browser |
| Entrega e defesa | M4 30 | docs/entrega.md, CONTRIBUTORS.md, docs/ia.md | seguir README em checkout limpo |
