# Entrega, reprodução e defesa — Projeto A

Fonte: enunciado oficial e cópia real em `evidencias/enunciado.html`. Inventário começou sem aplicação, repositório Git ou entregas anteriores no workspace. Repositório identificado depois pelo usuário: [PedroGiffoni/EngFullCycle-Marketplace](https://github.com/PedroGiffoni/EngFullCycle-Marketplace). Nenhuma evidência remota de CI verde é presumida.

## Matriz final

| Critério | Peso do módulo | Implementação / evidência | Reprodução | Situação verificada |
|---|---:|---|---|---|
| Fronteiras, SOLID, Strategy e Repository | M1 35 | src/modules, ADR 0001 | npm run lint; npm run coverage | Lint/tipos/fronteiras passaram; domínio e integração reais |
| Compose e inicialização | M1 35 | Dockerfile, docker-compose.yml, compose-build.txt | docker compose up --build -d --wait | Build, migração/peças e saúde executados; checkout limpo pendente |
| Seed em lotes e não duplicação | M1 35 | scripts/seed.ts, seed-first/second.txt | npm run seed; npm run verify:seed, duas vezes | 100.000 pedidos e itens em ambas |
| Domínio, integração e contrato | M2 20 | tests, coverage.txt | npm run coverage | 19 passaram; contrato rejeita tipo/campo incompatível |
| Coverage | M2 20 | vitest.config.ts, coverage.txt | npm run coverage | 100% linhas/funções/statements; 91,22% branches no escopo declarado |
| CI + OpenAPI lint + SCA | M2/M3 | .github/workflows/ci.yml, audit.json | npm ci; npm run lint:api; npm audit --audit-level=high | Lint real passou; SCA salvo sem alto/crítico, moderados presentes; execução remota pendente |
| Dois ambientes e configuração | M3 15 | compose.homolog.yml, .env.example | comandos README | Dev exercitado; homolog configurada, não iniciada |
| RED, correlação, trace e SLO | M3 15 | operacao.md, metrics.prom, jaeger-trace.json | npm run test:ops | Trace HTTP→fila real; SLO declarado, janela não observada |
| Flag e deploy | M3 15 | cache.ts, operacao.md | integração e Compose | Flag on/off e cache indisponível testados; recriação exercitada; rollback pendente |
| ADR, C4 e OpenAPI | M4 30 | docs/adr, docs/c4, openapi.yaml | npm run lint:api; ler diagramas | Documentação criada, OpenAPI validado |
| Cache, fila idempotente e k6 | M4 30 | desempenho.md, integration.test.ts, load | comandos desempenho | 12 consumidores concorrentes: um efeito; baseline real; comparação pendente |
| Marca, motion e Three | experiência | marca.md, experiencia.md, browser.json, PNGs | npm run test:browser | 10 passaram em desktop/celular reduzido, WebGL ausente e carga tardia |
| Autoria, entrega, IA e apresentação | M4 30 | CONTRIBUTORS, ia.md, este documento | revisão e ensaio abaixo | IA declarada; autoria acadêmica e submissão pendentes |

Coverage mede módulos e app; não mede bootstrap, worker/telemetria ou interface. Esses limites são explícitos para não apresentar 100% como cobertura do projeto inteiro.

## Roteiro de reprodução

1. Checkout limpo do GitHub, Node 24 e Docker ativos. Seguir README para subir, popular duas vezes, testar e consultar.
2. Confirmar 100 mil registros sintéticos via SQL: `SELECT count(*) FROM orders.orders WHERE id::text LIKE '00000000-0000-4000-8000-%'`; repetir para items.order_id.
3. Navegar catálogo → detalhe → 3D → sacola → quantidade → pagamento simulado. Conferir `paid` no pedido e recibo único no PostgreSQL.
4. Rodar checks e consultar execução verde real correspondente ao commit entregue. Se falhar, investigar logs; não apontar outro SHA como evidência.
5. Completar comparativo k6 com controle de snapshot, recursos e revisão. Não publicar melhoria sem segunda medição.
6. Rever autoria, links e datas antes da submissão.

## Texto pronto para Moodle — completar pendências

> Projeto A — Forma Brasileira. Repositório público: https://github.com/PedroGiffoni/EngFullCycle-Marketplace. Documentos: README.md, docs/desempenho.md, docs/adr/0001-decisao.md, docs/c4/, docs/openapi.yaml, docs/operacao.md, CONTRIBUTORS.md e docs/ia.md. Pipeline: inserir URL real de execução verde e SHA final após conferência. Estado: fluxo local implementado e testado; pendências e limitações descritas em docs/entrega.md. Autores: preencher identificação acadêmica e divisão real.

Não enviado ao Moodle. Enunciado informa limite 13/11, desconsidera commits posteriores; confirmar o ano diretamente com docente. Apresentação opcional em 16/11 ou vídeo enviado até 13/11. Não houve submissão, gravação nem ensaio humano.

## Defesa de dez minutos

| Tempo | Demonstração / argumento | Saber defender |
|---|---|---|
| 0–1 min | Problema, nível A, recorte fictício | Por que monólito modular e fatia pequena |
| 1–4 min | Catálogo API, filtro, luminária 3D, compra, consulta paid | Preço autoritativo, feedback assíncrono, fallback e teclado |
| 4–7 min | ADR, interfaces, schemas e pagamento | DIP, Strategy, Repository, custo das abstrações, atomicidade e unicidade |
| 7–10 min | Testes, trace, SQL, baseline e pendências | p95 por rota, limites da carga local, SLO de janela, por que ainda não alegar melhoria |

Em grupo, repartir conforme contribuições reais e commits/PRs. Antes de apresentar: conseguir explicar cada consulta, reproduzir uma falha de contrato, localizar o trace e justificar um resultado inconclusivo. Não decorar apenas números.
