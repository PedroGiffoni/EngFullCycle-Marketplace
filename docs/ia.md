# Uso de IA

## Prompt determinante recebido em 11/11/2026

> Leia as nove skills em .agents/skills/ e aplique-as ao Projeto A do curso Full Cycle. Comece pelo inventário com planejar-marketplace. Reaproveite minha stack e as entregas existentes. Construa uma fatia funcional de catálogo, pedido e pagamento de objetos de design brasileiro, aplicando direcao-de-marca antes de desenhar as telas. Integre motion-interface ao fluxo inteiro e vitrine-three à página de uma peça. Alimente a vitrine pela API real. Execute as etapas de contratos, operação, medição e entrega. Em cada etapa indique como reproduzir o resultado e o que preciso saber defender. Registre os prompts relevantes em docs/ia.md. Use somente evidências reais para CI, testes e desempenho. Informe impedimentos e avance nas etapas independentes.

Referência fornecida: https://henriquelopeslima.github.io/diglass/aulas/24-projeto-final.html

## Preferência adicional
README completo, visual e acessível, com imagens identificadas, sem fabricar screenshots, métricas, CI ou funcionalidades. Referência lida: `C:/Users/Pedro/Desktop/Segundo-Cerebro/Meu-Segundo-Cerebro/04-Skills-e-Prompts/Padrao-README-GitHub.md`.

## Aplicação e decisões da assistência
Codex leu as nove skills locais; começou pelo inventário e escreveu o guia de marca antes do HTML/CSS. Nenhuma aplicação preexistente foi encontrada no workspace. Adotou TypeScript/Fastify/PostgreSQL/Redis conforme sugestão da skill; interfaces públicas, Repository e Strategy. Sem subagentes. Criou ilustrações SVG próprias de peças fictícias e geometria Three sem modelo externo. Nome Forma Brasileira é provisório. Usou Motion para entrada/layout e CSS para feedback. Implementou API real e teste HTTP completo.

A IA gerou código, testes, contratos, diagramas e documentação; não substitui autoria acadêmica nem a capacidade de defesa. As decisões precisam ser compreendidas e assumidas pelo autor real. CONTRIBUTOR e histórico não foram inventados. Resultados reais são mantidos em `docs/evidencias/`; CI remoto e submissão não são presumidos a partir de testes locais.

## Ajustes motivados por evidência
- DNS no sandbox falhou para o enunciado; download público autorizado permitiu conferir a rubrica real.
- Docker estava parado e precisou ser iniciado; porta 5432 indisponível no Windows levou ao mapeamento 55432.
- npm encontrou peer dependencies incompatíveis no OpenTelemetry; foram selecionadas versões compatíveis, sem `--force` nem ignorar peers.
- Teste de contrato encontrou remoção silenciosa de campos adicionais; configuração passou a rejeitar entrada incompatível.
- Build Linux encontrou dependências opcionais ausentes no lockfile gerado em Windows; entradas explícitas foram adicionadas para `npm ci` reproduzível.
- Execução encontrou cliente `ioredis` opcional ausente no BullMQ atual; foi instalado.

## Continuação autorizada

Pedido: “Vamos seguir e comece a fazer comiits. Eu ja criei o projeto no github com nomeengenharia full cycle - marketplace”. O conector localizou e confirmou `PedroGiffoni/EngFullCycle-Marketplace`, vazio; primeiro README foi criado pelo conector. Depois do horário de liberação do limite da revisão automática, Git local foi inicializado e vinculado ao remoto, preservando arquivos. Commit da fatia funcional publicado. Nome e organização confirmados pelo usuário: “Individual — Pedro Toni Melo Giffoni”.

Ver `docs/desempenho.md` para hipótese, experimento e resultados sem transformar hipótese em medição.

## Verificações adicionais efetivamente feitas

Após autorização retomada: benchmark em banco descartável com volume restaurado a 100 mil pedidos em cada rodada, raw comprimido e piora de 3,10% no p95 do catálogo relatada sem alegar benefício. Checkout limpo de homologação subiu e testou. Parada real do Redis preservou catálogo, pagamento falhou sem confirmar e recuperou após retorno do serviço; isso motivou limite de espera da fila e bloqueio de edição de sacola pendente. Navegação de produto recebeu URL direta e histórico. Código formatado com Prettier para facilitar leitura e defesa.

Primeira CI remota falhou no apt da instalação do navegador por DNS de security.ubuntu.com, archive.ubuntu.com e azure.archive.ubuntu.com, depois de lint, suítes, SCA, build e seed passarem. Mudança: runner ubuntu-24.04 com bibliotecas preinstaladas, instalação apenas do Chromium e limites de duração. Resultado remoto final é registrado em docs/entrega.md quando observado; testes locais não foram usados como substituto de CI verde.
