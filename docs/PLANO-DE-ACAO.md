# Plano de ação — Proffy

Timebox: 45 min.

| MoSCoW | Item | Ganho | Esforço | Status |
|---|---|---|---|---|
| Must | Corrigir conversão de horário (D1) | Alto | Baixo | ✅ |
| Must | Consultas parametrizadas (D2) | Alto | Baixo | ✅ |
| Must | Respostas de erro e validação (D3, D5) | Alto | Médio | ✅ |
| Should | Contagem real de conexões (D4) | Alto | Baixo | ✅ |
| Should | Acessibilidade (D6) | Médio | Médio | ✅ axe 0 |
| Could | Área do professor (editar/remover) | Médio | Alto | Próximo ciclo |

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `master`. Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Alunos procuram professor particular por matéria e horário; professores querem ser achados. Projeto de estudo da Next Level Week 2.

**Hipótese e meta.** O aluno acha um professor e abre o contato em até 3 passos. Meta de estudo: fluxo completo na tela e nos testes.

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Matéria, disponibilidade por dia e hora e faixa de preço são os filtros básicos de uma plataforma de aulas | O Proffy já filtra por matéria, dia e hora. O preço máximo virou a #30 | [LowCode Agency: marketplace de tutoria](https://www.lowcode.agency/blog/how-to-build-a-tutor-marketplace), [Sharetribe: marketplace de tutoria](https://www.sharetribe.com/create/how-to-build-marketplace-for-tutoring/) |
| Mostrar o preço antes do contato evita frustração | O preço já aparece no cartão; mantido como regra | [Sharetribe: site como o Wyzant](https://www.sharetribe.com/create/how-to-build-website-like-wyzant/) |
| Quem ainda não sabe o horário quer ver primeiro quem ensina a matéria | Virou a #31: dia e horário opcionais | [Tutors.com: como achar um professor](https://tutors.com/articles/how-to-find-a-tutor) |
| Avaliações depois de cada aula, de preferência recentes | Fora do escopo do estudo (exige contas) | [LowCode Agency: tutoria entre pares](https://www.lowcode.agency/blog/how-to-build-a-peer-to-peer-tutoring-marketplace) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | CI nos PRs para a `developer` | Alto | Baixo | Este ciclo |
| 2 | Tirar do README o link de outro projeto | Alto | Baixo | Este ciclo |
| 3 | Teste da página de erro (critério 6) | Médio | Baixo | Este ciclo |
| 4 | Tirar o código antigo e a cópia do workflow | Médio | Baixo | Este ciclo |
| 5 | Fluxo completo na tela | Alto | Médio | #29 |
| 6 | Filtro por preço máximo | Médio | Baixo | #30 |
| 7 | Dia e horário opcionais | Médio | Baixo | #31 |
| 8 | Publicar com nome próprio | Médio | Baixo | Responsável (#26) |
| 9 | Proteger a `master` | Alto | Baixo | Responsável (#27) |
| 10 | Histórico com o banco de telefones | Alto | Baixo | Responsável (#28) |

**Fora do escopo.** Pagamento, agendamento, contas e avaliações.

### Engenharia

**Arquitetura.** Express com Nunjucks (`src/app.js`, views em `src/views`), repositório SQL em `src/repository.js` sobre `better-sqlite3` (`src/db/connection.js`, com migração dos dados antigos). Regras puras em `src/domain/catalog.js` e `src/lib/validation.js`. Sem front separado: HTML do servidor e CSS em `public/`.

**Riscos.**
- O nome `proffy` no Render é de outra pessoa; o `render.yaml` precisa de outro nome (#26).
- O SQLite de produção fica em `/tmp` e some a cada deploy.
- O `better-sqlite3` precisa compilar; no Windows sem ferramentas de C++ o app não roda localmente.

**Qualidade.**
- Testes: 9 com `node --test` e `supertest` (inclui 404 e 500 da página de erro).
- CI: agora também em PR e push para `developer/**`.
- Acessibilidade: axe sem violações em 3 telas (ciclo de 02/11).
- Segurança: consultas parametrizadas, `helmet`, limite de escrita; sem alertas abertos.

**Definição de pronto.** `npm ci` e `npm test`; CI verde no PR; `docs/MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.**
1. CI nos PRs e pushes para `developer/**`.
2. Remove `src/pages.js`, `src/database/` e `src/utils/` (versão anterior, sem import) e `ci/github-actions-ci.yml` (cópia do workflow).
3. Teste da página de erro em 404 e 500.
4. README sem o link de produção, que servia outro projeto; `docs/MVP.md` com régua N1 e critérios 9 e 10 em "Parcial".

**Vira issue.** #26, #27 e #28 (responsável); #29, #30 e #31 (agente).
