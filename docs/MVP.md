# MVP — proffy

> Revisto em 07/11/2026 (ciclo de 07/11/2026, executado em 09/11/2026). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24.22.1, `better-sqlite3` 12 instalado sem gravar no lock (`npm ci --ignore-scripts && npm i --no-save better-sqlite3@12`). Não houve teste com pessoas nem em aparelho real.

**Resumo:** 8 de 10 aplicáveis atendidos
**Finalizado:** sim

Os dois critérios que faltam dependem do responsável e têm issue com o rótulo `depende-do-responsavel`: 9 (#28) e 10 (#27).

## Critérios (07/11/2026)

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem dá aulas se cadastra, e quem estuda encontra professores. | README, 06/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: achar professor por matéria em até 3 passos; sem validação com pessoas. | Seção "Hipótese" |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: fluxo percorrido na tela com Chromium 158 (Playwright 1.57), nos modos claro e escuro: envio vazio mostra 7 mensagens; cadastro com 2 horários leva a "Cadastro concluído!"; a busca só pela matéria mostra o cartão com "Segunda-feira 08:30 às 12:00" e "Quarta-feira 14:00 às 18:00"; quarta 15:00 acha, quarta 18:00 não acha; "Entrar em contato" abre o WhatsApp com o texto da aula; a inicial passa de "0 professores cadastrados" a "Total de 1 conexão realizada". | `node proffy-fluxo.js` contra `npm start` local, 09/11/2026 (registro na seção "Ciclo de 07/11/2026" do plano e no PR) |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". | 06/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: dados inválidos dão 422 com mensagens; filtro inválido não busca e pede a matéria; rota e aula inexistentes dão 404; falha interna dá 500 sem vazar o detalhe. | `npm test`: 11 de 11, 09/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). O endereço `proffy.onrender.com` serve o projeto de outra pessoa. | #26 |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe (WCAG 2.1 AA) sem violações em início, "Dar aulas", sucesso e busca com resultado, nos modos claro e escuro, em 1280 e 375 px; foco com contorno em todas as tabulações da busca; sem rolagem horizontal em 375 px. | Playwright + `@axe-core/playwright`, 09/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Parcial: consultas parametrizadas, `helmet` e limite de escrita; o banco com telefones saiu do Git em 02/11, mas segue no histórico, à espera da decisão do responsável. | #28 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI roda em PR e push para `master` e `developer/**`, mas a `master` não tem proteção. | #27 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 11 testes (horários, busca com e sem dia e hora, filtros inválidos, injeção SQL, cadastro, contato, migração, páginas de erro). | `npm test`, 09/11/2026; CI do PR do ciclo |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`; seção de estado e próximos passos com o ciclo de 07/11. | README, 09/11/2026 |

## Hipótese

Praticar Node e SQLite: encontrar professor por matéria em até 3 passos. Com a busca só pela matéria (#31), bastam 2: escolher a matéria e filtrar.

## Fora do MVP

Pagamento, agendamento, contas e avaliações.

## Neste ciclo (07/11/2026)

Busca só pela matéria, com dia e hora opcionais e os horários no cartão (#31); título da tela Estudar em uma linha (o `main.css` fixava `h1` em 105 px); fluxo percorrido na tela (#29).

## Histórico

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
