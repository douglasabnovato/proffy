# Análise — Proffy

## 1. Especificação

Plataforma que conecta alunos a professores particulares. O professor cadastra matéria, valor da hora/aula e horários; o aluno filtra por matéria, dia e hora e fala com o professor pelo WhatsApp. Cada contato iniciado é uma **conexão** (métrica central do produto).

| Ator | Objetivo |
|---|---|
| Aluno | Encontrar professor disponível no horário desejado |
| Professor | Divulgar aulas e receber contatos |

### Requisitos funcionais

| ID | Requisito | Critério de aceite | Antes |
|---|---|---|---|
| RF01 | Cadastrar aula com N horários | Dado 2 horários válidos, ambos ficam pesquisáveis | ⚠️ horários corrompidos |
| RF02 | Buscar por matéria/dia/hora | Dado aula 08:30–12:00, busca 11:59 encontra; 12:00 não | ❌ D1 |
| RF03 | Contatar professor | Clique abre WhatsApp com mensagem e conta 1 conexão | ⚠️ sem contagem |
| RF04 | Mostrar total de conexões | Home exibe o número real | ❌ fixo "200" |

## 2. Defeitos encontrados

| # | Severidade | Defeito | Referência |
|---|---|---|---|
| D1 | Crítica | `Number((hour * 60) + minutes)` concatena string: 08:30 vira 48030 | Tipos em JS (coerção) |
| D2 | Crítica | SQL por interpolação na busca e no cadastro | OWASP A05:2025 |
| D3 | Alta | Erros só vão ao console; a requisição nunca responde | OWASP A10:2025 |
| D4 | Média | "200 conexões" é texto fixo | CDC art. 37 |
| D5 | Média | Sem validação de WhatsApp, avatar (URL) e horários (fim antes do início) | — |
| D6 | Média | `lang="en"`, ids repetidos ao clonar horários, contraste baixo | WCAG 2.2 |
| D7 | Baixa | Deploy configurado para GitHub Pages (não executa Node) | — |

## Rubrica v2 (grupo fullstack)

Aprovação: média ponderada ≥ 7,0 **e** C1 e C4 (eliminatórios) ≥ 5. Regras: nota sem evidência vale no máximo 6; C1 limitado a 7 para parte não executada de ponta a ponta; C9 ≥ 8 só com URL publicada e CI verde.

| # | Critério | Referência | Peso | Antes | Depois | Evidência | Justificativa |
|---|---|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Ries); SWEBOK Requirements | 16% | 3 | 8 | Testes de busca por intervalo e cadastro; Playwright nas 4 telas | `convertHoursToMinutes('08:30')` devolve 48030 (concatena texto): a busca por horário nunca acerta |
| C2 | Estados e condições excepcionais | Nielsen; OWASP A10:2025 | 8% | 2 | 8 | Testes 422/404; páginas próprias | `catch` só faz `console.log`: a requisição fica pendurada |
| C3 | Acessibilidade | WCAG 2.2 AA (axe-core) | 7% | 4 | 8 | axe-core: 0 violações em /, /study, /give-classes, /success | `lang="en"`; rótulos duplicados nos horários clonados; contraste 3,0:1 |
| C4 | Segurança e privacidade | OWASP Top 10:2025 / ASVS 5.0 N1 | 14% | 1 | 8 | Teste de injeção no filtro; CSP; rate limit | SQL montado com `${}` na busca e no cadastro |
| C5 | Dados | 3FN / ACID / fonte única | 10% | 3 | 8 | Teste da migração (matéria texto → código; horários corrompidos descartados) | Horários gravados corrompidos (69010); matéria ora texto, ora número |
| C6 | Testes | Pirâmide de testes; SWEBOK Testing | 9% | 0 | 8 | 8 testes | Nenhum teste |
| C7 | Qualidade de código | SOLID / camadas; SWEBOK Construction | 7% | 4 | 8 | Revisão: domínio/repo/validação/app | Regras misturadas em `pages.js` |
| C8 | Desempenho | Complexidade; Core Web Vitals | 5% | 5 | 7 | Índices de busca; LIMIT 50 | Consulta sem índice |
| C9 | Operação | 12-Factor; DORA | 7% | 2 | 7 | `/health`; render.yaml; CI em `ci/` (não executado) | Deploy via gh-pages (não roda servidor Express); porta fixa |
| C10 | Documentação | README como contrato | 5% | 5 | 8 | README + docs/ | README de aula |
| C11 | Produto e evidência | Cagan (4 riscos); Torres | 7% | 3 | 7 | Conexões reais contadas em `/contact/:id` e exibidas na home | "Total de 200 conexões" fixo no HTML (número falso) |
| C12 | Sustentabilidade técnica | OWASP A03:2025; SWEBOK Maintenance | 5% | 3 | 8 | `npm audit`: 0 vulnerabilidades | `sqlite-async` sem manutenção; nodemon |

**Média ponderada:** antes **2,64** (REPROVADO) → depois **7,81** (APROVADO).

