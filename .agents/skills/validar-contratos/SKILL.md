---
name: validar-contratos
description: Usar ao definir a API de catálogo e pedidos, testar regras de negócio e montar as verificações de qualidade na CI.
---
Escreva docs/openapi.yaml em OpenAPI 3.1 para as rotas reais de catálogo e pedidos. Especifique parâmetros, corpos, exemplos, respostas de sucesso e erros. Valide exemplos e contrato com lint no pipeline.
Teste unidades do domínio (quantidade inválida, total e transição de estado), integração com PostgreSQL real (persistência e rollback) e contrato da API (status, campos obrigatórios e tipos das respostas reais confrontados com o OpenAPI). Mostre que uma alteração incompatível faz falhar o teste de contrato.
Em .github/workflows/ci.yml instale dependências a partir do lockfile, rode lint de código e OpenAPI, as três suítes, cobertura e SCA das dependências. Declare limiar de cobertura no pipeline, exponha a métrica e confira resultado acima do mínimo. Configure falha do job diante de regressão ou achado acima da política declarada. Registre o link real da execução verde correspondente à revisão entregue.
