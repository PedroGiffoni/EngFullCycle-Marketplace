---
name: vitrine-three
description: Integrar Three.js ao detalhe de uma peça de design, com interação por toque, carregamento progressivo e fallback.
---

# Visualização de produto com Three.js
Escolha uma peça demonstrativa cuja forma ajude a entender o produto, como uma luminária. Monte a cúpula, haste e base com geometrias simples ou carregue GLB com licença registrada. Mantenha proporções e acabamento coerentes com a ficha. Faça a autoria da peça demonstrativa explícita.
Mostre imagem estática e dimensões no HTML inicial. Carregue three sob demanda ao ativar “Ver em 3D”. Enquadre o objeto com câmera em perspectiva e iluminação suave. Ofereça rotação por arrasto, botões de girar e restaurar vista com rótulos acessíveis. Preserve a rolagem vertical no celular. Evite rotação automática contínua.
Redimensione o canvas ao contêiner, limite a densidade de pixels e renderize por demanda. Ao desmontar, libere controles, texturas, materiais, geometrias, renderer e listeners. Se WebGL falhar, mantenha foto, preço e compra disponíveis. Valide em tela pequena, teclado, movimento reduzido, carregamento lento e WebGL indisponível. Meça o custo do 3D no navegador separado dos números de carga da API.
