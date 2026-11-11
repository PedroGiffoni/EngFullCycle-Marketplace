# Publicação para demonstração — Vercel e Render

Pedido do usuário: “Vamos subir pra vercel e render pra facilitar vuzializacao”. A publicação preserva a stack e o Compose local.

Arquitetura escolhida: assets Vite na Vercel; chamadas `/api/*` encaminhadas por rewrite ao monólito Fastify no Render. PostgreSQL e Redis ficam no mesmo workspace/região do Render, com acesso externo bloqueado. Consumidor de pagamento permanece no processo do monólito. Sem chaves de banco no frontend e sem necessidade de CORS entre navegador e API. O Render também serve a vitrine como alternativa direta.

`render.yaml` configura planos gratuitos de demonstração, PostgreSQL 17 e Redis com `noeviction`. Os 100 mil pedidos são preparados pelo seed determinístico quando `SEED_DEMO_ORDERS=true`. Migrações e catálogo continuam idempotentes. A imagem recebe sinais diretamente por `node --import tsx src/server.ts`. Readiness em `/ready`; porta fornecida pela plataforma.

No ambiente público, `OTEL_TRACES_EXPORTER=none` evita tentativas de exportar para Jaeger local inexistente. Logs JSON, correlação e métricas continuam; não alegar trace remoto coletado sem configurar um coletor. Evidência de trace local permanece válida e separada.

Limitações dos planos gratuitos, verificadas em [Render Free](https://render.com/docs/free): banco expira após 30 dias, Redis perde dados em reinício e o web service pode suspender por inatividade. São adequados à demonstração acadêmica. Em recuperação de fila, consultar/repetir o mesmo pedido pendente. Não usar os números do ambiente local como medição do Render.

Validação de estrutura: baixar o [schema oficial](https://render.com/schema/render.yaml.json) em `.verification/render-schema.json` e executar `node scripts/validate-render.mjs`. Validação da plataforma: `render blueprints validate render.yaml`, usando CLI autenticado quando exigido. Blueprint só é lido pelo Render depois do commit/push. Aprovação do plano é uma etapa distinta de validação; nenhuma publicação deve ser marcada pronta antes do deploy live/ready e compra verificada.

Estado desta revisão: configuração preparada; URLs e resultados serão acrescentados somente após observação real. Workspace Render e acesso público da Vercel aguardam confirmação solicitada pelo conector/revisão automática.
