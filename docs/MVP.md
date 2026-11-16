# MVP — proffy

> Revisto em 16/11/2026 (ciclo de 15/11/2026, com a correção da revisão independente). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24.22.1, `better-sqlite3` 12 instalado sem gravar no lock (`npm ci --ignore-scripts && npm i --no-save better-sqlite3@12`), e no CI (Ubuntu, Node 22). Não houve teste com pessoas nem em aparelho real.

**Resumo:** 8 de 10 aplicáveis atendidos
**Finalizado:** sim

Os 2 critérios que faltam dependem do responsável e têm issue com o rótulo `depende-do-responsavel`: 9 (#28) e 10 (#27). Os critérios 3 e 8 estavam com evidência só local; desde 15/11/2026 o teste de tela roda no CI (job `e2e`, #33).

## Critérios (16/11/2026)

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem dá aulas se cadastra, e quem estuda encontra professores por matéria, dia, hora e preço. | README, 15/11/2026 |
| 2 | Hipótese a validar | Aposta escrita, com meta | Atende: seção "Hipótese", com meta e "saberemos quando"; sem validação com pessoas. | Seção "Hipótese", 15/11/2026 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: `e2e/fluxo.e2e.js` no Chromium, no modo claro (o app não tem tema escuro próprio): envio vazio mostra 7 mensagens; cadastro com 2 horários leva a "Cadastro concluído!"; a busca só pela matéria mostra o cartão com os 2 horários; quarta 15:00 acha, quarta 18:00 não; "Até R$" 80,00 não acha e 80,50 acha; o contato redireciona (302) a `wa.me` com o texto da aula; a inicial mostra a conexão contada. | `npm run test:e2e` no job `e2e` do CI, [run 43797215558](https://github.com/douglasabnovato/proffy/actions/runs/43797215558) (PR #45), 16/11/2026: 3 passed |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". | 15/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta | Atende: dados inválidos dão 422 com mensagens (também na tela, 7 mensagens); filtro inválido não busca e pede a matéria; preço inválido é ignorado; busca sem resultado diz "Nenhum professor encontrado"; rota e aula inexistentes dão 404; falha interna dá 500 sem vazar o detalhe. | `npm test` no job `raiz`, [run 43795292316](https://github.com/douglasabnovato/proffy/actions/runs/43795292316), 15/11/2026: 13 de 13, `# skipped 0` |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). Sem publicação: `proffy.onrender.com` serve o projeto de outra pessoa. | #26 |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe (WCAG 2.1 A e AA) sem violações em início, "Dar aulas" com erros, sucesso, busca com e sem resultado e inicial com conexão, em 1280 px, no modo claro (o app não tem tema escuro próprio: nenhum CSS usa `prefers-color-scheme`); início, busca e "Dar aulas" também em 375 px, sem rolagem horizontal; contorno de foco nos 4 campos da busca pelo teclado. O teste achou contraste de 3,49 no botão Estudar em 375 px; corrigido para 4,73. Em 16/11, o botão ganhou contorno branco, porque o fundo dele era o mesmo da página. | `npm run test:e2e` (`@axe-core/playwright` 4.14) no job `e2e`, [run 43797215558](https://github.com/douglasabnovato/proffy/actions/runs/43797215558) (PR #45), 16/11/2026: 3 passed |
| 9 | Segurança e conformidade | Riscos decididos | Parcial: `npm audit --omit=dev` com 0 vulnerabilidades e 0 alertas do Dependabot; consultas parametrizadas, `helmet` com CSP e limite de escrita; o banco com telefones saiu do Git em 02/11, mas segue no histórico, à espera da decisão do responsável. | `npm audit --omit=dev` e `gh api .../dependabot/alerts?state=open`, 15/11/2026; #28 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: ruleset `principal-protegida` ativo na `master` (PR obrigatório, sem force push nem exclusão); o workflow `CI` (jobs `raiz` e `e2e`) roda em PR e push para `master` e `developer/**`. O ruleset ainda não exige os checks `raiz` e `e2e` verdes; pedido ao responsável na #27. | `gh api repos/douglasabnovato/proffy/rulesets`, 15/11/2026: `principal-protegida`, `active` |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 13 testes de unidade e integração (horários, busca com e sem dia, hora e preço, filtros inválidos, injeção SQL, cadastro, contato, migração, páginas de erro) e 3 de tela no Chromium. | [run 43797215558](https://github.com/douglasabnovato/proffy/actions/runs/43797215558) (PR #45), 16/11/2026: `raiz` 13 de 13, `# skipped 0`, e `e2e` 3 passed |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto | Atende: comandos do README conferidos com o `package.json` (`start`, `dev`, `test`, `test:e2e`); sem link publicado, porque o serviço ainda não existe. | README, 15/11/2026 |

## Hipótese

Acreditamos que buscar só pela matéria, com dia, hora e preço opcionais, deixa o aluno achar um professor e abrir o contato em até 3 passos (escolher a matéria, filtrar, entrar em contato). Saberemos quando o teste de tela no CI fizer o cadastro, achar o professor em 3 passos e a inicial mostrar a conexão contada. Meta de estudo: praticar Node, SQLite e testes no navegador.

## Fora do MVP

Pagamento, agendamento, contas, avaliações e banco persistente.

## Neste ciclo (15/11/2026)

Teste de tela com Playwright e axe no CI, no modo claro (#33); contraste do botão Estudar em 375 px; filtro por preço máximo (#30); `render.yaml` com nome de serviço próprio e `docs/DEPLOY.md` refeito (#26).

## Histórico

### 15/11/2026 (ciclo de 15/11/2026): 9 de 10

A revisão independente do PR #40 achou, em 16/11: o critério 10 em "Atende" sem os checks obrigatórios (volta a "Parcial"); um projeto "escuro" no Playwright que repetia o claro, porque o app não tem tema escuro (removido); esperas do teste que podiam passar na página antiga (agora esperam a URL); e o botão Estudar sem contorno sobre o fundo roxo (contorno branco).


### 09/11/2026 (ciclo de 07/11/2026): 9 de 10

Critérios 3 e 8 em "Atende" com o roteiro local `node proffy-fluxo.js` (09/11) e o critério 10 com a `master` protegida (10/11). Em 15/11/2026, 3 e 8 foram revistos para "Parcial", porque a régua pede o teste no navegador no CI (#33), e voltaram a "Atende" no mesmo ciclo com o job `e2e`.
### 06/11/2026 (ciclo de 03/11/2026)

> Revisto em 06/11/2026 (ciclo de 03/11/2026). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24; o app roda só no CI, porque o `better-sqlite3` não compila nesta máquina. Não houve teste com pessoas nem em aparelho real.

Finalizado: não. Falta o critério 3 (fluxo na tela, #29). Os critérios 9 (#28) e 10 (#27) dependem do responsável.

### Tabela de 06/11/2026: 7 de 10 aplicáveis atendidos

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem dá aulas se cadastra, e quem estuda encontra professores. | README, 06/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: proposta na seção 2; sem validação com pessoas. | Seção 2 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: telas vistas no navegador em 02/11; o cadastro só é coberto pelos testes automáticos. | #29 |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. | 06/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: dados inválidos dão 422 com mensagens; rota e aula inexistentes mostram a página de erro com 404; falha interna mostra 500 sem vazar o detalhe. | `tests/app.test.js` (9 testes), CI do #25, 06/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). O endereço `proffy.onrender.com` serve o projeto de outra pessoa. | #26 |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações em 3 telas e foco visível em todas as tabulações; sem rolagem em 375 px. | Ciclo de 02/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Parcial: `npm audit --omit=dev` e Dependabot sem alertas abertos; o banco com telefones saiu do Git em 02/11, mas segue no histórico, à espera da decisão do responsável. | #28 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI roda em PR e push para `master` e `developer/**`, mas a `master` não tem proteção. | #27 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 9 testes (horários, busca, injeção SQL, cadastro, contato, migração, páginas de erro). | CI do #25 |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`; link de produção, que era de outro projeto, retirado; seção de estado e próximos passos. | README, 06/11/2026 |

#### Hipótese (proposta)

Praticar Node e SQLite: encontrar professor por matéria em até 3 passos.

#### Fora do MVP

Pagamento e agendamento.

#### Ciclo de 03/11/2026

CI nos PRs para `developer/**`; código antigo (`src/pages.js`, `src/database/`, `src/utils/`) e cópia do workflow em `ci/` removidos; teste da página de erro; link de outro projeto retirado do README; documentação e 6 issues (#26 a #31).
