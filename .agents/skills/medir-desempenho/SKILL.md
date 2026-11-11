---
name: medir-desempenho
description: Usar para planejar p95, testar cache e fila idempotente e comparar medições reais de carga com k6.
---
Em docs/desempenho.md defina rota, carga, meta de p95, tolerância de defasagem do catálogo e comportamento com cache indisponível. Implemente TTL coerente com essa tolerância e fallback ao banco. Simule indisponibilidade e verifique resposta correta.
Use chave idempotente estável no consumidor de pagamento. Garanta unicidade no banco e registre efeito e processamento na mesma transação. Reentregue o mesmo evento, inclusive em concorrência, e demonstre um único efeito persistido.
Crie cenário k6 com três estágios explícitos (rampa, sustentação e redução), checks funcionais, thresholds de p95 e erros. Execute sobre ambiente próprio com os 100 mil pedidos confirmados. Separe p95 por operação. Salve comando, revisão, recursos, duração, VUs e saídas brutas.
Meça a linha de base; investigue um gargalo com RED, trace ou plano SQL; altere uma variável ligada à hipótese e repita com o mesmo volume, perfil de carga e política de aquecimento. Compare p95, taxa de erro e vazão. Relate piora ou resultado inconclusivo quando ocorrer. Deixe hipóteses separadas de resultados observados.
