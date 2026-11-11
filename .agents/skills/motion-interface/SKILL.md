---
name: motion-interface
description: Projetar e verificar motion design de ponta a ponta no catálogo, filtros, produto, carrinho e pagamento.
---

# Movimento na interface
Mapeie cada evento a uma resposta perceptível. Use CSS para estados simples e uma biblioteca de motion compatível com a stack para presença e mudanças de layout. Centralize tempos e curvas em tokens.
| Evento | Coreografia sugerida |
|---|---|
| Entrada na vitrine | Revelar imagem e título uma vez, com deslocamento vertical curto e opacidade em 320 ms. |
| Filtrar catálogo | Preservar foco, animar reposicionamento dos cards por 220 ms e anunciar a quantidade de resultados. |
| Abrir produto | Conectar imagem do card ao detalhe quando suportado e preservar retorno à posição do catálogo. |
| Adicionar ao carrinho | Confirmar no botão e atualizar contador após sucesso da API. Animar o painel lateral em 240 ms. |
| Alterar quantidade | Atualizar preço e subtotal juntos; em falha, restaurar o estado e oferecer nova tentativa. |
| Pagar | Mostrar processamento, bloquear envio duplicado e animar confirmação apenas com resposta válida. |
Implemente equivalentes a hover para teclado e toque. Use transform e opacity, limite animações simultâneas e permita interromper transições em cliques rápidos. Em prefers-reduced-motion elimine deslocamento, paralaxe e escalas; preserve mensagens e feedback imediato. Teste voltar, filtrar repetidamente, fechar painel com Escape e completar compra com movimento reduzido. Registre as verificações efetivamente executadas.
