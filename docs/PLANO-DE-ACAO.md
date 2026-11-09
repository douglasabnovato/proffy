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

## Ciclo de 07/11/2026

> Executado em 09/11/2026. Branch `feature/2026-11-07` → `developer/sprint-2026-11-12` → `master` (o PR para a `master` fica aberto para o responsável). Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Os mesmos do ciclo anterior: alunos procuram professor por matéria e horário; professores querem ser achados.

**Hipótese e meta.** Achar um professor e abrir o contato em até 3 passos. Meta do ciclo: fluxo percorrido na tela (#29) e busca só pela matéria (#31).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Filtros devem seguir o jeito como a pessoa decide (matéria, horário, orçamento), não a estrutura do banco | A matéria é o único filtro obrigatório; dia e hora refinam | [LowCode Agency: filtros em marketplaces](https://www.lowcode.agency/blog/search-filtering-system-design-for-marketplace-apps) |
| Filtro opcional precisa de um padrão "qualquer" claro, para não esconder resultados | Opção "Qualquer dia" e frase explicando que dia e hora são opcionais | [Algolia: boas práticas de filtros](https://www.algolia.com/blog/ux/search-filter-ux-best-practices/) |
| O teste de ponta a ponta sobe o servidor e navega por URL relativa | Roteiro local com Playwright contra `npm start`; levar ao CI virou issue | [Playwright: webServer](https://playwright.dev/docs/test-webserver) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Percorrer o fluxo na tela (critério 3) | Alto | Médio | Este ciclo (#29) |
| 2 | Busca só pela matéria, com os horários no cartão | Médio | Baixo | Este ciclo (#31) |
| 3 | Título da tela Estudar em uma linha | Baixo | Baixo | Este ciclo |
| 4 | Fluxo na tela no CI | Médio | Médio | #33 |
| 5 | Regra global de largura do `h1`, `span` e `a` | Baixo | Baixo | #34 |
| 6 | Filtro por preço máximo | Médio | Baixo | #30 |
| 7 | Publicação, proteção da `master` e histórico | Alto | Baixo | Responsável (#26, #27, #28) |

**Fora do escopo.** Pagamento, agendamento, contas e avaliações.

### Engenharia

**Arquitetura.** Sem mudança: Express com Nunjucks, repositório SQL em `src/repository.js` sobre `better-sqlite3`, regras em `src/lib/validation.js`. A busca usa `@weekday IS NULL OR ...` e `@minutes IS NULL OR ...` com parâmetros, sem montar SQL por texto.

**Riscos.**
- O redirecionamento para `wa.me` sai para a internet no teste de tela; o Playwright não intercepta pedidos redirecionados.
- `better-sqlite3` 11 não compila no Node 24 do Windows; o teste local usa a 12 sem gravar no lock.

**Qualidade.** 11 testes com `node --test`; axe e teclado no roteiro de tela; CI em PR para `developer/**` e `master`.

**Definição de pronto.** `npm test` verde local e no CI; fluxo percorrido na tela com registro; `docs/MVP.md` e README atualizados.

### Fluxo percorrido na tela (#29)

Ambiente: Windows 10, Node 24.22.1, `npm ci --ignore-scripts && npm i --no-save better-sqlite3@12`, `PORT=5578 DATABASE_FILE=<banco novo> npm start`, Chromium 158 pelo Playwright 1.57, viewport 1280 × 900, modos claro e escuro. Data: 09/11/2026.

| Passo | O que se fez | O que a tela mostrou |
|---|---|---|
| 1 | Abrir `/` | "0 professores cadastrados"; axe 0 |
| 2 | "Dar aulas" e salvar vazio | 7 mensagens de erro nos campos; axe 0 |
| 3 | Preencher nome, avatar, WhatsApp, biografia, Matemática, R$ 80,50, segunda 08:30–12:00 e, com "+ Novo horário", quarta 14:00–18:00 | "Cadastro concluído! Tudo certo: sua aula já aparece nas buscas dos alunos." |
| 4 | "Ver aulas", só a matéria, "Filtrar" | Cartão com "Segunda-feira 08:30 às 12:00" e "Quarta-feira 14:00 às 18:00", preço R$ 80,50; axe 0 |
| 5 | Quarta, 15:00 | O cartão aparece |
| 6 | Quarta, 18:00 | "Nenhum professor encontrado" (fim do intervalo é exclusivo) |
| 7 | "Entrar em contato" | Nova aba no WhatsApp com "Olá, Ana Teste! Tenho interesse na sua aula de Matemática." |
| 8 | Voltar a `/` | "Total de 1 conexão realizada" |
| 9 | Tab na busca; largura 375 px | Contorno de foco em todos os campos; sem rolagem horizontal em `/`, `/study` e `/give-classes` |

Primeira passada: o axe acusou contraste nos rótulos da busca, porque o título quebrava uma palavra por linha (`main.css` fixa `h1` em 105 px) e empurrava o formulário para fora do fundo roxo. Corrigido no commit `8c48062`; segunda passada sem violações.

### Plano de ação

**Este ciclo executa.**
1. Busca só pela matéria, com dia e hora opcionais e os horários no cartão (#31), com 2 testes novos.
2. Título da tela Estudar em uma linha e dica dos filtros acima do formulário.
3. Fluxo percorrido na tela e registrado (#29).
4. `docs/MVP.md` com uma tabela só e histórico; README com o estado do ciclo.

**Vira issue.** #33 (fluxo na tela no CI), #34 (largura fixa no `main.css`) e #36 (responsável: mesclar o ciclo, porque o merge foi negado à sessão do agente). Seguem abertas #26, #27 e #28 (responsável) e #30.
