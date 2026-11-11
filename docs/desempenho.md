# Desempenho — observações reais e plano comparativo

## Plano

Rotas: GET `/api/products` (p95 <300 ms), GET `/api/orders/{id}` (p95 <300 ms), POST `/api/orders` (p95 <500 ms). Tolerância de erro <1%; checks >99%. Perfil em `load/scenario.js`: rampa 10 s até 10 VUs, sustentação 30 s, redução 10 s até zero. Pausa 100 ms por iteração. Três operações por iteração. Política de aquecimento: sem rodada prévia dedicada, rampa incluída na amostra; manter igual no comparativo.

Catálogo: defasagem tolerada 30 s; TTL 30 s. Flag false na linha de base; true no experimento proposto. Redis indisponível faz fallback ao banco no catálogo, sem impedir consulta de preços. Teste real com cliente Redis fechado verificou fallback. Pagamento usa eventId estável e unicidade PostgreSQL, com efeito/processamento em uma transação. Integração executou 12 consumidores concorrentes e confirmou exatamente um recibo e um claim. Fluxo HTTP confirmou processamento BullMQ real; concorrência unitária do consumidor não equivale a teste de queda/reentrega do servidor Redis.

## Volume e recursos

Seed determinístico em lotes de 5.000: 100.000 pedidos e 100.000 itens; execução repetida sem duplicação (`seed-first.txt`, `seed-second.txt`, `sql-count.txt`). Há também pedidos de testes e a carga cria mais pedidos. A quantidade sintética não muda; um comparativo rigoroso deve restaurar o mesmo snapshot antes de cada rodada para manter também o total igual.

Ambiente real: Windows / Docker Desktop Linux, PostgreSQL 17-alpine, Redis 7-alpine, app Node 24; k6 1.4.2 em contêiner da mesma rede Compose. Recursos selecionados do engine em `evidencias/benchmark-resources.json` (dump integral docker-info.json mantido apenas localmente); não foram impostos limites individuais de CPU/memória. Jaeger e logging estavam ativos. Sem isolamento de ruído do host. Revisão: execução sobre arquivos locais antes dos primeiros commits; commit posterior não deve ser apresentado como SHA presente durante a medição. Manifesto de fonte e digest da imagem devem acompanhar futura repetição controlada.

## Linha de base executada em 11/11/2026

```powershell
$env:CATALOG_CACHE_ENABLED='false'
docker compose up -d --no-deps app
docker compose run --rm k6 run --summary-export=/results/baseline-summary.json --out json=/results/baseline-raw.json /scripts/scenario.js
```

Saídas reais: `baseline-console.txt`, `baseline-summary.json`, `baseline-raw.json` no diretório local `docs/evidencias`. Raw integral está no GitHub comprimido sem perda em baseline-raw.json.gz; resumo e console também preservados. Duração 50 s, até 10 VUs, 3.747 iterações completas, 11.241 requisições, 22.482 checks, todos passaram.

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

Plano do experimento posteriormente executado: snapshot isolado igual, mesmo build e mesmas fontes, alternar **somente flag do cache**, mesma política de aquecimento e perfil. Capturar comando, manifesto/revisão, digest da imagem, contagens antes de cada rodada, recursos, métricas RED e raw. Repetir se ruído dominar. Relatar piora ou inconclusão. Exemplo de segunda rodada, depois de restaurar snapshot e aguardar prontidão:

```powershell
$env:CATALOG_CACHE_ENABLED='true'
docker compose up -d --no-deps app
docker compose run --rm k6 run --summary-export=/results/cache-summary.json --out json=/results/cache-raw.json /scripts/scenario.js
```

## Comparativo controlado executado após a liberação do limite

A revisão automática ficou temporariamente indisponível por limite de uso; após o horário indicado, voltou a autorizar execução. O comparativo foi concluído em `compose.benchmark.yml`, projeto **forma-benchmark**, banco **forma_benchmark**, Redis e portas próprios. Nenhum dado da galeria ou de homologação foi apagado. `reset-benchmark.ts` recusa qualquer banco/ambiente diferente do descartável nomeado. Ambas as consultas anteriores à carga confirmaram **exatamente 100.000 pedidos e 100.000 itens totais**, conforme `controlled-before-seed.txt` e `controlled-after-seed.txt`.

Imagem idêntica nas duas rodadas: `sha256:e7cea7c13ce1a404e809dd85de95a8de13640b6836661cb97739a95c6215daa4` (`benchmark-image.txt`). Código funcional baseado em `0e107c8e73eda3b7a514d4263bca582eac78ff70`, mais configuração isolada de benchmark, antes dos ajustes posteriores de tratamento de falha da fila e formatação. Não atribuir os números a um commit posterior como se tivessem sido medidos nele. Nenhuma rota, consulta ou regra de domínio foi alterada entre as duas rodadas.

Recursos observados: Docker Desktop Linux/WSL2, **24 CPUs lógicas e 33.235.824.640 bytes de memória** disponíveis ao engine, sem limites de contêiner (`benchmark-resources.json`). Mesmos três estágios, 50 s, 10 VUs, sem aquecimento dedicado. Mudou apenas a flag de cache. Banco e Redis descartáveis reiniciados/repovoados antes de cada fase. O seed não reinicia o processo PostgreSQL nem expulsa páginas do buffer; ruído de cache do sistema e serviços paralelos permanecem limitações.

| Indicador | Sem cache | Com cache | Variação |
|---|---:|---:|---:|
| p95 catálogo | 1,406749 ms | 1,450427 ms | **+3,10% (piora)** |
| p95 consulta pedido | 2,164270 ms | 2,086564 ms | −3,59% |
| p95 criação | 9,316037 ms | 7,612085 ms | −18,29% |
| Erros HTTP | 0% | 0% | Sem diferença |
| Vazão total | 225,38 req/s | 226,47 req/s | +0,48% |
| Requisições / iterações | 11.283 / 3.761 | 11.328 / 3.776 | Perfil fechado, contagem depende do tempo de resposta |

**Conclusão:** a hipótese de melhorar o p95 do catálogo não foi confirmada; houve pequena piora. As variações de outras operações não demonstram causalidade do cache. Duas amostras locais sem repetição estatística não permitem alegar ganho global. Metas funcionais/latência foram atendidas nesse perfil; não há gargalo relevante comprovado no catálogo de quatro peças. Manter cache como exercício de flag/fallback, avaliar sua remoção se não surgir benefício com catálogo e carga maiores.

Reproduzir a experiência completa no ambiente próprio: `powershell -File scripts/benchmark.ps1` na raiz. O script registra revisão, working tree, imagem, volume e comandos; restaura **somente** o ambiente descartável. Raw integral das três execuções foi comprimido sem perda: `baseline-raw.json.gz`, `controlled-before-raw.json.gz`, `controlled-after-raw.json.gz`. SHA-256 dos JSON originais em `raw-manifest.json`. Descomprimir com gzip ou biblioteca padrão Node/Python; os JSON originais de cerca de 40 MB cada permanecem ignorados pelo Git. Resumos, consoles e `comparison.json` estão versionados.

## Saber defender

p95 não é média; thresholds por operação evitam esconder criação lenta no catálogo rápido; aumento de volume durante teste precisa ser controlado no comparativo; cache pode piorar um catálogo pequeno; unicidade garante efeito único apesar de entrega repetida; um número observado não comprova uma janela SLO ou melhoria causal.

