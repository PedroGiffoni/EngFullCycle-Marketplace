# Forma Brasileira — direção de marca

Nome provisório, sem aprovação de marca. Galeria comercial de objetos de design brasileiro contemporâneo. A seleção desta demonstração é **inteiramente fictícia**, sem atribuição a designers, regiões ou técnicas reais. Não representa estoque ou comércio ativo.

Voz de curadoria: material, escala e uso em frases curtas. Exemplo: “Luz baixa para a mesa. Cúpula em alumínio e base em madeira.” Evitar superlativos, procedência inventada e promessas de sustentabilidade sem comprovação.

Assinatura tipográfica: “forma / brasileira”, alinhamento à esquerda; respiro mínimo de uma altura do “f”. Versões monocromáticas em tinta sobre papel ou branco sobre tinta. Nunca distorcer, aplicar sombras ou usar argila como texto corrido.

Tokens implementados em `web/style.css`: papel #F8F6F1; superfície #FFFFFF; tinta #242523; secundário #585A54; argila #904530. Argila reserva compra, seleção e foco. Sucesso e erro têm texto explícito. Títulos Instrument Serif/Georgia, controles DM Sans/system-ui. Fontes remotas são melhoria progressiva; fallbacks funcionam sem rede. Escala fluida, espaçamentos múltiplos de 4, preços tabulares. Contrastes serão calculados em teste real.

Desktop: 12 colunas; celular: 4, controles em 360 px. Destaque editorial + grade. Detalhe agrupa objeto, material, dimensões, preço e compra. Carrinho como diálogo lateral. Estados: carregamento, vazio, falha com repetição, pendente e confirmação válida.

Direção de imagem: luz lateral suave, fundo neutro, mesmo enquadramento. Nesta entrega as imagens são **ilustrações vetoriais próprias de produtos fictícios**, identificadas na UI e no README; não são fotografias nem screenshots. A luminária em Three segue as dimensões da ficha. Capturas de verificação serão diferenciadas dessas ilustrações.

Motion: tokens de 220, 240 e 320 ms; deslocamento curto e opacidade. Motion para presença/layout; CSS para hover/foco. Em movimento reduzido, retirar deslocamento e escala, manter feedback textual. Evitar giro automático, excesso de animações e bloquear compra por falha de WebGL.
