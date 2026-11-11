# Experiência: marca, motion e Three

Guia de marca escrito antes das telas: `docs/marca.md`. Interface implementada em TypeScript com Motion e CSS. Catálogo usa `/api/products`, detalhe usa `/api/products/:id`, pedido e confirmação passam pela API e banco reais. Produtos e autoria são explicitamente fictícios.

| Evento | Resposta implementada | Como reproduzir |
|---|---|---|
| Entrada | Opacidade + deslocamento curto em 320 ms | Abrir `/` |
| Filtro | Layout com Motion em 220 ms, foco no botão e contagem aria-live | Alternar filtros rapidamente |
| Detalhe | Diálogo, foco nativo e retorno à posição anterior | Abrir peça e Escape |
| Sacola | Feedback após consulta API; painel em 240 ms | Adicionar peça |
| Quantidade | Preço e total atualizados juntos após API; falha preserva estado | Usar +/−; simular falha de rede |
| Pagamento | Bloqueio de envio, processamento, polling e confirmação válida | Criar pedido e pagar |

Em `prefers-reduced-motion`, não aplicar deslocamentos/escala; feedback textual permanece. Tokens de duração ficam no CSS. A presença e o layout em Motion leem os mesmos tokens CSS; tempos ficam centralizados em `web/style.css`. Filtros usam contador de requisição para impedir resposta atrasada de substituir a seleção atual. Sem transição compartilhada da imagem; melhoria progressiva opcional.

Three carrega por import dinâmico ao ativar “Ver em 3D”. Geometrias próprias da luminária: cúpula, haste e base; altura total 0,40 m e diâmetro 0,24 m, coerentes com ficha. Iluminação hemisphere/direcional, câmera perspectiva. Renderização somente em resize/interação; DPR limitado a 1,5. Arrasto horizontal preserva `touch-action: pan-y`. Botões e teclado (setas/Home); sem giro contínuo. Desmontagem remove listeners/observer e libera geometrias, materiais, renderer e contexto. Sem GLB externo e sem licença de modelo externa.

## Verificações executadas

`npm run test:browser`: **10 passaram**, cinco em desktop 1440×1000 e cinco em celular 360×800, toque e movimento reduzido. Evidência bruta: `docs/evidencias/browser.json` e `browser-run.txt`. Verificados filtros repetidos, foco, Escape, retorno do foco ao card, quantidade, compra real, 3D tardio, teclado e liberação do canvas. WebGL foi desabilitado por instrumentação do navegador: fallback manteve imagem e compra. Import atrasado 500 ms mostrou “Carregando”. Testes de erro/vazio usam respostas deliberadamente instrumentadas, identificadas nos testes; compra principal usa API real.

Capturas `catalogo-*`, `detalhe-*`, `carrinho-*`, `confirmacao-*`, `three-*` foram feitas por Playwright. Catálogo desktop e sacola 360 px também foram inspecionados visualmente. O teste de overflow confirmou largura sem rolagem horizontal. Contraste foi calculado a partir dos tokens realmente carregados e validado ≥4,5:1 para tinta/papel, secundário/papel, branco/argila e argila/papel. Anexos em browser.json preservam valores e custos 3D.

Custos do 3D estão separados da carga HTTP: build original gerou chunk Three de 533,53 kB (132,10 kB gzip), baixado sob demanda. `performance.measure('product-3d-activation')` e Resource Timing foram anexados nos testes. Não converter tempo de ativação local em benchmark geral nem somar ao p95 da API. Não houve inspeção em aparelho físico, leitor de tela ou medição de FPS.

## Saber defender

Por que identificação de produto fictício evita falsa procedência; alinhamento entre tokens e guia; movimento reduzido mantém feedback; foco e mensagens importam mais que animação; 202 não é pagamento confirmado; por que Three é tardio e precisa de fallback/dispose; limitação dos testes em emulação móvel.

