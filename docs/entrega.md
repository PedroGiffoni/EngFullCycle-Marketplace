# Entrega, reprodução e defesa — Projeto A

**Demonstração pública:** [Vercel](https://forma-brasileira.vercel.app) · [Render](https://forma-brasileira-api-7fo6.onrender.com). Publicação com PostgreSQL Supabase free, smoke de compra aprovado, 14 testes de navegador públicos aprovados e 100 mil pedidos/itens sintéticos confirmados por SQL remoto. [Detalhes e evidências](publicacao.md). As limitações dos planos gratuitos e o auto-deploy manual da API estão documentados; disponibilidade contínua não foi medida.

Fonte: enunciado oficial e cópia real em `evidencias/enunciado.html`. Inventário começou sem aplicação, repositório Git ou entregas anteriores no workspace. Repositório identificado depois pelo usuário: [PedroGiffoni/EngFullCycle-Marketplace](https://github.com/PedroGiffoni/EngFullCycle-Marketplace). PR de revisão: [#1](https://github.com/PedroGiffoni/EngFullCycle-Marketplace/pull/1). CI verde observada na revisão c764bf1e06cf13e5b79d6a169ace4d67f48bf699: [execução 43214359370](https://github.com/PedroGiffoni/EngFullCycle-Marketplace/actions/runs/43214359370); resumo real em evidencias/ci-green.json.

## Matriz final

| Critério | Peso do módulo | Implementação / evidência | Reprodução | Situação verificada |
|---|---:|---|---|---|
| Fronteiras, SOLID, Strategy e Repository | M1 35 | src/modules, ADR 0001 | npm run lint; npm run coverage | Lint/tipos/fronteiras passaram; domínio e integração reais |
| Compose e inicialização | M1 35 | Dockerfile, docker-compose.yml, compose-build.txt | docker compose up --build -d --wait | Build, migração/peças e saúde executados; checkout limpo c764bf1 subiu, seed repetido confirmou 100 mil pedidos/itens e 20 testes passaram (checkout-final.json) |
| Seed em lotes e não duplicação | M1 35 | scripts/seed.ts, seed-first/second.txt | npm run seed; npm run verify:seed, duas vezes | 100.000 pedidos e itens em ambas |
| Domínio, integração e contrato | M2 20 | tests, coverage.txt | npm run coverage | 20 passaram; contrato rejeita tipo/campo incompatível |
| Coverage | M2 20 | vitest.config.ts, coverage.txt | npm run coverage | 100% linhas/funções/statements; 91,22% branches no escopo declarado |
| CI + OpenAPI lint + SCA | M2/M3 | .github/workflows/ci.yml, audit.json | npm ci; npm run lint:api; npm audit --audit-level=high | CI verde 43214359370: lint, OpenAPI, três suítes, cobertura, SCA, build, seed e 14 browser; 10 moderados, nenhum alto/crítico |
| Dois ambientes e configuração | M3 15 | compose.homolog.yml, .env.example | comandos README | Dev e homologação em checkout limpo exercitados; volumes/portas separados |
| RED, correlação, trace e SLO | M3 15 | operacao.md, metrics.prom, jaeger-trace.json | npm run test:ops | Trace HTTP→fila real; SLO declarado, janela não observada |
| Flag e deploy | M3 15 | cache.ts, operacao.md | integração e Compose | Flag on/off e cache indisponível testados; recriação e rollback em homologação exercitados; indisponibilidade Redis e recuperação confirmadas |
| ADR, C4 e OpenAPI | M4 30 | docs/adr, docs/c4, openapi.yaml | npm run lint:api; ler diagramas | Documentação criada, OpenAPI validado |
| Cache, fila idempotente e k6 | M4 30 | desempenho.md, integration.test.ts, load | comandos desempenho | 12 consumidores concorrentes: um efeito; cache: catálogo +3,10%, sem ganho; sacola de quatro peças: INSERTs de itens 4→1, p95 10,27→9,27 ms nesta amostra; raw e limitações documentados |
| Marca, motion e Three | experiência | marca.md, experiencia.md, browser.json, PNGs | npm run test:browser | 14 passaram em desktop/celular reduzido, WebGL ausente e carga tardia |
| Autoria, entrega, IA e apresentação | M4 30 | CONTRIBUTORS, ia.md, este documento | revisão e ensaio abaixo | IA declarada; autoria individual confirmada; submissão e ensaio humano pendentes |

Coverage mede módulos e app; não mede bootstrap, worker/telemetria ou interface. Esses limites são explícitos para não apresentar 100% como cobertura do projeto inteiro.

CI Linux no checkout inicial reportou 87,71% de branches; execução local Windows reportou 91,22%. Ambas acima do mínimo de 70%; linhas/funções/statements 100% no escopo declarado. Não substituir um resultado pelo outro: diferenças de instrumentação/runtime permanecem registradas em checkout-verify.txt e coverage.txt.

Ação restante do autor: revisar a entrega e enviar no Moodle. O roteiro de defesa está pronto; ensaio e apresentação opcional dependem do autor. A coleta contínua da janela SLO não foi realizada; o SLO está declarado com consulta de verificação, conforme o requisito. Confirmar o ano das datas com o docente. Comparativo adicional investigou inserções sequenciais de itens; redução de consultas comprovada e ganho de p95 observado com limitações explícitas. O comparativo não comprovou benefício do cache. O SCA tem 10 achados moderados em ferramentas de desenvolvimento; política atual bloqueia alto/crítico, mas os moderados devem ser acompanhados.

## Roteiro de reprodução

1. Checkout limpo do GitHub, Node 24 e Docker ativos. Seguir README para subir, popular duas vezes, testar e consultar.
2. Confirmar 100 mil registros sintéticos via SQL: `SELECT count(*) FROM orders.orders WHERE id::text LIKE '00000000-0000-4000-8000-%'`; repetir para items.order_id.
3. Navegar catálogo → detalhe → 3D → sacola → quantidade → pagamento simulado. Conferir `paid` no pedido e recibo único no PostgreSQL.
4. Rodar checks e consultar execução verde real correspondente ao commit entregue. Se falhar, investigar logs; não apontar outro SHA como evidência.
5. Reproduzir o comparativo k6 com scripts/benchmark.ps1 e discutir a pequena piora observada no catálogo; não alegar ganho.
6. Reproduzir a investigação de itens com scripts/benchmark-items.ps1 e scripts/summarize-items.mjs, conforme docs/desempenho.md; explicar a redução de consultas e os limites da variação de p95.
7. Rever autoria, links e datas antes da submissão.

## Texto pronto para Moodle — envio pelo autor

> Projeto A — Forma Brasileira. Repositório público: https://github.com/PedroGiffoni/EngFullCycle-Marketplace. Documentos: README.md, docs/desempenho.md, docs/adr/0001-decisao.md, docs/c4/, docs/openapi.yaml, docs/operacao.md, CONTRIBUTORS.md e docs/ia.md. Pipeline verde: https://github.com/PedroGiffoni/EngFullCycle-Marketplace/actions/runs/43214359370 (revisão c764bf1e06cf13e5b79d6a169ace4d67f48bf699; conferir também o check do commit final de documentação). Demonstração: https://forma-brasileira.vercel.app. Estado: fluxo público implementado e testado; pendências e limitações descritas em docs/entrega.md. Autor: Pedro Toni Melo Giffoni, individual, com assistência de IA declarada.

O autor informou que fará o envio no Moodle; o agente não realizou a submissão. Enunciado informa limite 13/11, desconsidera commits posteriores; confirmar o ano diretamente com docente. Apresentação opcional em 16/11 ou vídeo enviado até 13/11. Não houve submissão, gravação nem ensaio humano.

## Defesa de dez minutos

| Tempo | Demonstração / argumento | Saber defender |
|---|---|---|
| 0–1 min | Problema, nível A, recorte fictício | Por que monólito modular e fatia pequena |
| 1–4 min | Catálogo API, filtro, luminária 3D, compra, consulta paid | Preço autoritativo, feedback assíncrono, fallback e teclado |
| 4–7 min | ADR, interfaces, schemas e pagamento | DIP, Strategy, Repository, custo das abstrações, atomicidade e unicidade |
| 7–10 min | Testes, trace, SQL, baseline e pendências | p95 por rota, limites da carga local, SLO de janela, limites do ganho de p95 e ausência de benefício comprovado do cache |

Trabalho individual: Pedro apresenta catálogo, pedidos, pagamento e as evidências. Antes de apresentar: conseguir explicar cada consulta, reproduzir uma falha de contrato, localizar o trace e justificar um resultado inconclusivo. Não decorar apenas números.
