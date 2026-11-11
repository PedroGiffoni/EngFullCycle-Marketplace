# ADR 0001 — Monólito modular com PostgreSQL e fila de pagamento

Status: implementado; verificação e limites em `docs/entrega.md`.

## Contexto
Projeto A exige catálogo, pedido, pagamento, volume e evidências em prazo curto. O diretório original não continha aplicação nem stack. Precisamos de um fluxo demonstrável sem gateway financeiro real.

## Decisão
Um processo Node/TypeScript/Fastify serve API e assets Vite e executa um consumidor BullMQ. PostgreSQL guarda três schemas: catalog, orders e payments. Redis atende cache descartável e fila. Jaeger recebe spans OTLP. Cada módulo possui suas tabelas e expõe portas públicas. Composição fica em `src/server.ts`; `scripts/boundaries.mjs` rejeita importações de internos entre módulos.

SOLID: inversão de dependência em `OrderRepository`, que recebe `Catalog`; responsabilidade separada entre regras puras, acesso ao banco e transporte HTTP. Strategy concreto: `PaymentGateway` com `SimulatedPayment`, substituível na composição por outro gateway. Um gateway real exigiria reconciliação externa e não teria atomicidade conjunta com PostgreSQL.

Database Pattern: Repository em `catalog/repository.ts` e `orders/repository.ts` isola SQL da aplicação. O custo é manter mapeamentos, interfaces e consultas explícitas; não há ORM nem abstração de banco universal. O pedido congela preço e nome e persiste itens na mesma transação. Não aceita total enviado pelo cliente.

Pagamento usa chave `payment-{orderId}`, claim único em payments.processed, recibo único por pedido e porta transacional pública `orders/index.public.ts`. Claim, transição e recibo são confirmados na mesma transação. Conflitos e falhas revertem o claim. O lock do pedido impede transição concorrente. Redis pode reenviar sem duplicar efeito no banco.

## Alternativa descartada
Microsserviços com bancos separados: introduziriam transações distribuídas, rede e deploys extras sem necessidade para quatro produtos. Um único módulo CRUD seria menor, mas esconderia as fronteiras exigidas. ORM acrescentaria geração e migrações sem benefício suficiente neste recorte.

## Consequências e limites
Deploy do monólito acopla API e worker; escalar ambos juntos não é ideal. Fila local não tem persistência de volume no Compose: queda destrutiva do Redis pode exigir reenfileirar pagamentos pendentes; a API permite repetir usando a chave estável. Cache nunca participa do cálculo de preço (find consulta banco). Sem login, estoque, frete, webhook real ou cobrança real. Endpoints e métricas devem ficar locais; antes de exposição pública é necessário autenticação e política de acesso. Sem alegação de produção.
