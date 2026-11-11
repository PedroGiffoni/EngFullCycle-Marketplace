---
name: construir-marketplace
description: Usar para implementar o monólito modular, persistência, dados sintéticos e inicialização reproduzível do Projeto A.
---
Defina interfaces públicas para catálogo, pedidos e pagamento. Faça cada módulo controlar suas tabelas. Proíba importações de componentes internos entre módulos e verifique as dependências. Mantenha um único aplicativo modular. Exercite o fluxo completo por HTTP.
Faça o pedido consultar o catálogo por interface, congelar preço e quantidade e calcular o total no servidor. Persista pedido e itens atomicamente. Registre pagamento simulado por uma interface substituível. Documente o princípio SOLID aplicado e justifique um design pattern concreto, como Strategy no pagamento. Aplique também um Database Pattern, como Repository, e registre onde ele isola consultas e qual o custo dessa decisão.
Entregue docker-compose.yml. Em checkout limpo, docker compose up --build deve inicializar dependências, migrações e aplicação. Aguarde prontidão real dos serviços. Implemente seed determinístico em lotes com ao menos 100.000 pedidos e seus itens. Documente o comando, confira a contagem via SQL e rode novamente para demonstrar que o volume não duplica.
