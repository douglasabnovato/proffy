# MVP — proffy

> Revisto em 06/11/2026 (ciclo de 03/11/2026). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24; o app roda só no CI, porque o `better-sqlite3` não compila nesta máquina. Não houve teste com pessoas nem em aparelho real.

**Finalizado: não.** Falta o critério 3 (fluxo na tela, #29). Os critérios 9 (#28) e 10 (#27) dependem do responsável.

## 1. Critérios: 7 de 10 aplicáveis atendidos

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

## 2. Hipótese (proposta)

Praticar Node e SQLite: encontrar professor por matéria em até 3 passos.

## 3. Fora do MVP

Pagamento e agendamento.

## 4. Neste ciclo

CI nos PRs para `developer/**`; código antigo (`src/pages.js`, `src/database/`, `src/utils/`) e cópia do workflow em `ci/` removidos; teste da página de erro; link de outro projeto retirado do README; documentação e 6 issues (#26 a #31).
