# Operação, ambientes e defesa

## Reproduzir

Desenvolvimento: `docker compose up --build -d --wait`; galeria em http://localhost:3000. Homologação: `docker compose -f docker-compose.yml -f compose.homolog.yml up --build -d --wait`; http://localhost:3001. Volumes e nomes de projetos distintos. Migrações e quatro peças carregam ao iniciar. Para 100 mil pedidos: `docker compose exec app npm run seed`.

Configuração: `.env.example` contém apenas exemplos locais. Compose lê `.env` para interpolação; `npm start` usa variáveis do processo. Nunca versionar `.env`. Senha de demonstração não deve ser reutilizada em hospedagem. Homologação foi configurada; homologação e checkout limpo executados na revisão 0e107c8 (checkout-build.txt, checkout-verify.txt). Desenvolvimento pelo Compose foi executado e ficou saudável.

## RED e trace real

`/metrics` expõe `http_requests_total{route,method,status}` e `http_request_duration_seconds{route,method,le}`. Rótulos usam templates de rota, nunca UUID/usuário. Erros são requisições 5xx. Logs JSON incluem reqId e traceId. `x-request-id` é UUID gerado pelo servidor; não confiamos em cabeçalho arbitrário do cliente. `x-trace-id` permite encontrar o trace.

Execute `npm run test:ops` contra o app ativo. Saídas reais: `docs/evidencias/metrics.prom`, `trace.json`, `jaeger-trace.json`. Trace capturado: `39a55746196163e6b3543527629a6991`, com spans `POST /api/orders/:id/payments` e `payment.consume` no mesmo trace. Acesse [Jaeger local](http://localhost:16686/trace/39a55746196163e6b3543527629a6991). Jaeger armazena em memória; JSON exportado preserva a evidência após reinício. Sem propagação de entrada W3C de clientes; contexto interno é explicitamente levado ao consumidor.

## SLO declarado

Indicador: proporção de GET `/api/products` com duração ≤300 ms. Meta: ≥95% em janela móvel de sete dias, incluindo respostas de erro na duração; acompanhar erros separadamente. Consulta PromQL para um coletor futuro:

```promql
sum(increase(http_request_duration_seconds_bucket{route="/api/products",method="GET",le="0.3"}[7d]))
/
sum(increase(http_request_duration_seconds_count{route="/api/products",method="GET"}[7d])) >= 0.95
```

Erros: `sum(rate(http_requests_total{route="/api/products",status=~"5.."}[5m])) / sum(rate(http_requests_total{route="/api/products"}[5m]))`. Taxa total usa `sum(rate(http_requests_total[5m]))`. Não há Prometheus/Grafana no Compose e não houve coleta de sete dias. A amostra k6 de 50 segundos não comprova cumprimento do SLO.

## Flag e falhas

`CATALOG_CACHE_ENABLED=true` por padrão; `false` usa banco. TTL 30 s, tolerância de defasagem de até 30 s. Detalhe e cálculo de pedido sempre consultam preço no banco. Teste de integração exercitou ligado, desligado, hit, TTL e cliente Redis fechado com fallback ao banco. Falha da fila não deve confirmar compra; reenviar com mesmo pedido. Redis pode perder eventos em recriação: reenvio de pendentes é necessário. Não há garantia de durabilidade de produção.

Para alternar no PowerShell:

```powershell
$env:CATALOG_CACHE_ENABLED='false'
docker compose up -d --no-deps app
# Depois: $env:CATALOG_CACHE_ENABLED='true'; repetir comando.
```

A linha de base foi executada com cache desligado e o ambiente pode permanecer assim até retomar o comparativo. O default de um novo shell continua `true`.

## Deploy e rollback

Estratégia: recriação de um único contêiner app. Adequada a demonstração local, com breve indisponibilidade; não declarar zero downtime. Atualização: `docker compose up --build -d --wait app`, conferir `/ready`, rodar `npm run test:ops`, inspecionar logs. Migrações atuais são aditivas e idempotentes. Em evolução, não remover colunas durante a mesma versão de deploy.

Rollback proposto: guardar SHA/tag da imagem anterior, restaurar essa imagem no serviço app e recriar; conferir prontidão e o mesmo smoke. Não reverter banco por exclusão de dados; usar migração compatível ou restauração testada. Reconstrução/recriação e saúde foram exercitadas. Rollback local foi exercitado em homologação: a imagem atual substituiu temporariamente a original, que foi restaurada e passou novamente no smoke de pedido/pagamento. Digest restaurado em rollback-image.txt. Deploy público não exercitado. O Dockerfile inclui ferramentas de desenvolvimento para facilitar avaliação; uma imagem de produção deveria separar o runtime.

## Indisponibilidade real exercitada

Além do cliente Redis fechado no teste de integração, o serviço Redis de desenvolvimento foi parado e restaurado. `redis-outage.json`: catálogo 200 com quatro produtos e pagamento 500 após limite de espera de 2 s, sem confirmação falsa. Worker, fila e exportador de eventos têm listeners de erro; o processo continuou servindo HTTP. `redis-recovery.json`: após Redis voltar, pedido `1ef820bd-2e45-4381-b4b6-ce51175700ac` ficou paid e readiness respondeu 200. O enqueue pendente pode concluir depois da resposta de erro; por isso a UI preserva o mesmo pedido e não permite mudar a sacola enquanto há pedido pendente. O cliente deve consultar/repetir o mesmo pedido, nunca assumir que uma falha HTTP prova ausência de processamento.

## Saber defender

Por que separar liveness de readiness; por que readiness cobre banco mas não garante pagamento; por que cache é descartável e fila exige recuperação; baixa cardinalidade das métricas; diferença entre amostra e janela SLO; correlação HTTP→fila; custo de executar API e worker juntos; por que deploy simples tem interrupção.


