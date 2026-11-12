# Uso de IA — instruções iniciais e prompts estruturantes

Este trabalho individual de **Pedro Toni Melo Giffoni** utilizou Codex para implementar código, testes, contratos, diagramas e documentação. O autor é responsável por revisar, reproduzir e defender as decisões. O histórico Git registra alterações assistidas; não representa escrita manual integral.

## Prompt inicial de maior elaboração

Transcrição do pedido que estruturou o projeto:

> Leia as nove skills em .agents/skills/ e aplique-as ao Projeto A do curso Full Cycle. Comece pelo inventário com planejar-marketplace. Reaproveite minha stack e as entregas existentes. Construa uma fatia funcional de catálogo, pedido e pagamento de objetos de design brasileiro, aplicando direcao-de-marca antes de desenhar as telas. Integre motion-interface ao fluxo inteiro e vitrine-three à página de uma peça. Alimente a vitrine pela API real. Execute as etapas de contratos, operação, medição e entrega. Em cada etapa indique como reproduzir o resultado e o que preciso saber defender. Registre os prompts relevantes em docs/ia.md. Use somente evidências reais para CI, testes e desempenho. Informe impedimentos e avance nas etapas independentes.

Referência fornecida: [enunciado do Projeto Final](https://henriquelopeslima.github.io/diglass/aulas/24-projeto-final.html).

O prompt definiu escopo, ordem de execução, integração com dados reais, reprodução e rigor das evidências. O inventário não encontrou aplicação ou entregas anteriores no workspace. A stack sugerida pelas instruções locais foi adotada: TypeScript, Fastify, PostgreSQL e Redis. A identidade foi documentada antes das telas. A API alimenta catálogo, pedidos e pagamento simulado; a peça e as ilustrações demonstrativas são fictícias e identificadas.

## Como as nove skills iniciais orientaram o trabalho

Skills são instruções reutilizáveis em arquivos `SKILL.md`. Elas detalham critérios e verificações do prompt inicial; não são nove conversas independentes nem resultados de testes. Os caminhos abaixo permitem consultar as instruções efetivamente usadas.

| Skill inicial | Instrução central e aplicação | Onde reproduzir e o que defender |
|---|---|---|
| [planejar-marketplace](../.agents/skills/planejar-marketplace/SKILL.md) | Inventariar antes de implementar, confrontar a rubrica M1–M4, preservar entregas e distinguir implementação de verificação. | [Entrega](entrega.md): matriz de critérios, evidências e comandos; justificar o recorte do Projeto A. |
| [construir-marketplace](../.agents/skills/construir-marketplace/SKILL.md) | Monólito modular com interfaces públicas, schemas próprios, preço calculado no servidor, pedido atômico, Strategy e Repository; seed determinístico em lotes. | [README](../README.md), [ADR](adr/0001-decisao.md): subir Compose, repetir seed e explicar fronteiras, transação e padrões. |
| [direcao-de-marca](../.agents/skills/direcao-de-marca/SKILL.md) | Definir posicionamento, voz, tokens, tipografia e estados antes das telas. Aplicada à galeria Forma Brasileira, com autoria fictícia explícita. | [Marca](marca.md): relacionar tokens ao código e explicar material, escala, contraste e composição responsiva. |
| [motion-interface](../.agents/skills/motion-interface/SKILL.md) | Mapear feedback do catálogo ao pagamento; CSS para estados simples e Motion para presença/layout; preservar foco e movimento reduzido. | [Experiência](experiencia.md): executar testes de navegador e defender estados pendentes, confirmação, teclado e retorno. |
| [vitrine-three](../.agents/skills/vitrine-three/SKILL.md) | Luminária proporcional à ficha, Three sob demanda, interação por toque/teclado, renderização por demanda e fallback estático. | [Experiência](experiencia.md): abrir a luminária e testar WebGL ausente; explicar custo, descarte de recursos e acessibilidade. |
| [validar-contratos](../.agents/skills/validar-contratos/SKILL.md) | OpenAPI 3.1 confrontado com respostas reais; domínio, PostgreSQL e contrato; cobertura e SCA na CI. | [OpenAPI](openapi.yaml), `npm run coverage`, `npm run lint:api`: explicar entrada incompatível, rollback e escopo da cobertura. |
| [operar-marketplace](../.agents/skills/operar-marketplace/SKILL.md) | Dois ambientes, configuração externa, logs JSON, RED, correlação, trace, SLO, flag e rollback verificável. | [Operação](operacao.md), [publicação](publicacao.md): localizar trace e distinguir SLO declarado de janela observada. |
| [medir-desempenho](../.agents/skills/medir-desempenho/SKILL.md) | Carga k6 em três estágios sobre 100 mil pedidos; investigar gargalo, alterar uma variável, guardar raw e relatar resultado real; consumidor idempotente. | [Desempenho](desempenho.md): reproduzir comparativos e defender p95, ruído, cache e efeito único no pagamento. |
| [preparar-entrega](../.agents/skills/preparar-entrega/SKILL.md) | ADR, C4 das unidades reais, README reproduzível, autoria e IA explícitas, revisão e texto do Moodle. | [Entrega](entrega.md), [CONTRIBUTORS](../CONTRIBUTORS.md): consultar links verificáveis e ensaiar a defesa. Envio no Moodle realizado pelo autor. |

## Instruções estruturantes complementares

A preferência permanente de README pediu documentação completa, visual e acessível, com instalação, configuração sem segredos, arquitetura, testes, publicação, limitações e status reais. A referência local lida foi `Padrao-README-GitHub.md`, indicada no `AGENTS.md` do usuário. Essa orientação é uma especificação permanente; não é apresentada como novo prompt de implementação.

A revisão final foi orientada pelo pedido:

> Faca tudo que esta faltando . Quero que exponha apenas os prompts mais elaborados.. pequenas conversas quero q sejam tratadas apenas como refino interativo. Explique as skiils iniciais e os prompts mais elaborados de inicio.

Aplicação: consolidar a explicação das skills, revisar a evidência de desempenho e os documentos finais, registrar alterações em commits e preparar uma PR verificável. O usuário informou que fará o envio no Moodle.

## Refino interativo

As conversas curtas foram agrupadas como refino interativo: identificação do repositório e da autoria individual; autorização dos commits; escolha de Vercel pública e Render gratuito; adoção de Supabase gratuito diante da indisponibilidade de outro PostgreSQL gratuito; acesso restrito da API; ajustes de navegação, feedback e documentação. Não são reproduzidas aqui como uma lista de prompts elaborados.

Durante esse refinamento, evidências motivaram correções concretas: rejeição de campos incompatíveis no contrato, dependências e lockfile reproduzíveis no Linux, instalação do Chromium na CI após falha de DNS do apt, espera limitada da fila, recuperação após indisponibilidade do Redis e configuração da CA oficial do Supabase com validação TLS ativa. Detalhes técnicos permanecem nos documentos correspondentes.

O primeiro experimento de cache não comprovou ganho e foi mantido com essa conclusão. Publicação e compra foram verificadas por HTTP, navegador e SQL; os resultados estão em [evidências](evidencias/). Nenhuma aprovação, submissão acadêmica, execução de CI ou métrica é inferida apenas da intenção de executá-la.
