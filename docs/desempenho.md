# Desempenho — observações reais e plano comparativo

## Plano

Rotas: GET `/api/products` (p95 <300 ms), GET `/api/orders/{id}` (p95 <300 ms), POST `/api/orders` (p95 <500 ms). Tolerância de erro <1%; checks >99%. Perfil em `load/scenario.js`: rampa 10 s até 10 VUs, sustentação 30 s, redução 10 s até zero. Pausa 100 ms por iteração. Três operações por iteração. Política de aquecimento: sem rodada prévia dedicada, rampa incluída na amostra; manter igual no comparativo.

Catálogo: defasagem tolerada 30 s; TTL 30 s. Flag false na linha de base; true no experimento proposto. Redis indisponível faz fallback ao banco no catálogo, sem impedir consulta de preços. Teste real com cliente Redis fechado verificou fallback. Pagamento usa eventId estável e unicidade PostgreSQL, com efeito/processamento em uma transação. Integração executou 12 consumidores concorrentes e confirmou exatamente um recibo e um claim. Fluxo HTTP confirmou processamento BullMQ real; concorrência unitária do consumidor não equivale a teste de queda/reentrega do servidor Redis.

## Volume e recursos

Seed determinístico em lotes de 5.000: 100.000 pedidos e 100.000 itens; execução repetida sem duplicação (`seed-first.txt`, `seed-second.txt`, `sql-count.txt`). Há também pedidos de testes e a carga cria mais pedidos. A quantidade sintética não muda; um comparativo rigoroso deve restaurar o mesmo snapshot antes de cada rodada para manter também o total igual.

Ambiente real: Windows / Docker Desktop Linux, PostgreSQL 17-alpine, Redis 7-alpine, app Node 24; k6 1.4.2 em contêiner da mesma rede Compose. Recursos reais do engine em `evidencias/docker-info.json`; não foram impostos limites individuais de CPU/memória. Jaeger e logging estavam ativos. Sem isolamento de ruído do host. Revisão: execução sobre arquivos locais antes dos primeiros commits; commit posterior não deve ser apresentado como SHA presente durante a medição. Manifesto de fonte e digest da imagem devem acompanhar futura repetição controlada.

## Linha de base executada em 11/11/2026

```powershell
$env:CATALOG_CACHE_ENABLED='false'
docker compose up -d --no-deps app
docker compose run --rm k6 run --summary-export=/results/baseline-summary.json --out json=/results/baseline-raw.json /scripts/scenario.js
```

Saídas reais: `baseline-console.txt`, `baseline-summary.json`, `baseline-raw.json` no diretório local `docs/evidencias`. Raw volumoso pode não estar no GitHub nesta primeira publicação; resumo e console preservam a evidência entregue. Duração 50 s, até 10 VUs, 3.747 iterações completas, 11.241 requisições, 22.482 checks, todos passaram.

| Indicador | Linha de base sem cache | Cache ligado |
|---|---:|---|
| p95 catálogo | 1,56 ms | Não medido |
| p95 consulta de pedido | 2,26 ms | Não medido |
| p95 criação | 8,62 ms | Não medido |
| Taxa de erros | 0% | Não medido |
| Vazão total HTTP | 224,35 req/s | Não medido |

São amostras locais; não justificam capacidade em produção nem cumprimento de SLO de sete dias.

## Investigação e hipótese

`EXPLAIN (ANALYZE, BUFFERS)` real do catálogo (`explain-catalog.txt`): Index Scan, 4 linhas, 2 shared hits, execução 0,089 ms, planejamento 0,634 ms. Não se observou gargalo relevante na leitura dessas quatro peças. O POST foi a operação mais lenta, mas ainda muito abaixo da meta. Hipótese: cache pode reduzir acesso ao banco; com catálogo tão pequeno e Redis via rede, o custo adicional pode anular o ganho. Não tratar isso como resultado de melhoria.

Próximo experimento: snapshot isolado igual, mesmo build e mesmas fontes, alternar **somente flag do cache**, mesma política de aquecimento e perfil. Capturar comando, manifesto/revisão, digest da imagem, contagens antes de cada rodada, recursos, métricas RED e raw. Repetir se ruído dominar. Relatar piora ou inconclusão. Exemplo de segunda rodada, depois de restaurar snapshot e aguardar prontidão:

```powershell
$env:CATALOG_CACHE_ENABLED='true'
docker compose up -d --no-deps app
docker compose run --rm k6 run --summary-export=/results/cache-summary.json --out json=/results/cache-raw.json /scripts/scenario.js
```

## Impedimento real

A revisão automática de permissões passou a falhar por limite de uso antes da atualização do SCA, após a linha de base. Não foi executada a segunda rodada. Nenhum “antes/depois” foi fabricado e o requisito comparativo continua pendente. Retomar com acesso autorizado à execução local, preservando o snapshot e os controles descritos.

## Saber defender

p95 não é média; thresholds por operação evitam esconder criação lenta no catálogo rápido; aumento de volume durante teste precisa ser controlado no comparativo; cache pode piorar um catálogo pequeno; unicidade garante efeito único apesar de entrega repetida; um número observado não comprova uma janela SLO ou melhoria causal.
