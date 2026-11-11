---
name: operar-marketplace
description: Usar ao configurar ambientes, observabilidade, feature flag, SLO e estratégia de deploy do marketplace.
---
Configure dois ambientes distinguíveis e reproduzíveis, por exemplo desenvolvimento e homologação. Externalize configurações e segredos, entregue .env.example com exemplos seguros e demonstre como selecionar cada ambiente.
Emita logs JSON com ID de correlação. Exponha métricas RED de taxa, erros e duração por rota usando rótulos de baixa cardinalidade. Propague contexto da requisição ao processamento de pagamento. Capture um trace real, registre seu identificador e como encontrá-lo.
Declare um SLO com indicador, limiar, janela e rota. Exemplo de decisão ajustável: 95% das leituras de catálogo abaixo de 300 ms em sete dias. Dê a consulta para verificá-lo e diferencie uma amostra de carga do cumprimento da janela.
Implemente uma flag de cache do catálogo, valide os dois estados e documente o valor padrão. Escolha e justifique uma estratégia de deploy compatível com o ambiente. Descreva atualização, verificação de saúde e rollback. Declare quais passos foram exercitados.
