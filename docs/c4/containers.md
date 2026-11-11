# C4 — contêineres executáveis

```mermaid
flowchart LR
  visitor[Visitante / navegador]
  subgraph system[Forma Brasileira]
    subgraph app[Contêiner app: Node + Fastify / API + assets + worker]
      catalog[Catálogo]
      orders[Pedidos]
      payments[Pagamento simulado / BullMQ worker]
      orders -->|interface pública Catalog| catalog
      payments -->|porta transacional pública| orders
    end
    pg[(Contêiner PostgreSQL\nschemas catalog / orders / payments)]
    redis[(Contêiner Redis\ncache e fila)]
    jaeger[Contêiner Jaeger\ntraces OTLP]
  end
  visitor -->|HTML CSS JS + HTTP JSON| app
  catalog --> pg
  catalog -->|TTL 30s / fallback| redis
  orders --> pg
  payments -->|claim e recibo| pg
  payments <-->|eventos e reentregas| redis
  app -->|spans OTLP HTTP| jaeger
```

Vite é ferramenta de build; não é serviço em produção. O JavaScript (incluindo Three sob demanda) executa no navegador. Consumidor e API compartilham um processo no contêiner app. Não há Prometheus executável no Compose; `/metrics` expõe formato compatível para coleta futura.
