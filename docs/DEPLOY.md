# Deploy · Proffy

Plano de ação para publicar a plataforma que conecta alunos a professores particulares em hospedagem gratuita.

## 1. Desafio

Colocar no ar, sem custo, uma aplicação Express + Nunjucks + SQLite (better-sqlite3) em que professores publicam nome, foto, biografia, WhatsApp, preço e horários, e alunos filtram por matéria, dia e hora. O cadastro é público, então a publicação precisa manter o limite de envios por IP, o aviso de que os dados ficam visíveis e deixar claro que o banco do plano gratuito é temporário.

## 2. Conteúdo

### Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render, 1 web service gratuito (escolhida)** | Roda o servidor Express; blueprint `render.yaml` já no repositório; deploy automático a cada push |
| GitHub Pages | Não serve: só publica arquivos estáticos, e o projeto precisa de servidor Express e banco |
| Netlify/Vercel | Não executam um servidor Express contínuo com SQLite em disco |
| VPS ou disco persistente pago | Fora da regra do portfólio (só hospedagem gratuita) |

### O que foi ajustado para produção

| Mudança | Arquivo | Por quê |
|---|---|---|
| `NODE_VERSION` `22` | `render.yaml` | O Node 20 saiu de suporte em abr/2026 |
| `autoDeployTrigger: commit` | `render.yaml` | Cada push na `master` publica sozinho |
| `NODE_ENV=production` | `render.yaml` | O `npm ci` deixa de instalar dependências de teste |
| `DATABASE_FILE=/tmp/proffy.sqlite` | `render.yaml` | Caminho gravável e explícito para o SQLite no Render |
| `TRUST_PROXY=1` (já existia) | `render.yaml` | Sem isso o limite de 5 cadastros/min contaria todos os visitantes como um só IP (o do proxy do Render) |
| CI com Node 22 | `ci/github-actions-ci.yml` → mover para `.github/workflows/ci.yml` | Testes e `npm audit` a cada push, na mesma versão da produção |
| `src/database/database.sqlite` no `.gitignore` | `.gitignore` | Depois do `git rm --cached`, o `git add -A` não volta a versionar o banco |
| Seção "Em produção" | `Readme.md` | URL, hospedagem e aviso de dados temporários |

### Limitações do plano gratuito

- **Os dados somem a cada reinício ou deploy**: o disco do Render Free é temporário. O banco de produção **sobe vazio** (sem professores nem conexões) sempre que o serviço reinicia, dorme e acorda em outra máquina, ou recebe um novo deploy. Quem abrir o link vai ver a busca sem resultados até alguém cadastrar uma aula. Para persistir, o caminho gratuito seria PostgreSQL (Neon), o que é mudança de arquitetura (decisão pendente).
- O serviço dorme após 15 min sem acesso e leva cerca de 1 min para acordar.
- As 750 horas gratuitas por mês são da conta inteira do Render, somando todos os serviços.

### Pontos de atenção (segurança e LGPD)

- O cadastro publica **nome, foto, biografia e WhatsApp** de quem se cadastra. O formulário já avisa ("ficarão visíveis para alunos que buscarem aulas"). Numa demonstração pública, cadastre apenas dados fictícios e não peça a terceiros que usem o site com dados reais.
- Não há login nem forma de o professor apagar o próprio cadastro: em um uso real, isso seria exigido pela LGPD (direito de eliminação). Na versão gratuita, o reinício do serviço apaga tudo, mas isso não substitui a funcionalidade (decisão pendente).
- Limite de 5 cadastros por minuto por IP, conteúdo escapado e foto só por link `https://`.
- `src/database/database.sqlite` tem dados de teste antigos: não versione bancos (objetivo do `git rm --cached`).

## 3. Solução (passo a passo)

Branch principal: **`master`**.

### Etapa 1 · Validar localmente (Git Bash)

1. `cd /c/ambiente-projeto/ser-mvp/proffy`
2. Apagar os arquivos substituídos (saem do Git e do disco):
   `git rm src/pages.js src/utils/format.js src/database/createProffy.js src/database/db.js src/database/fake.data.js src/database/test.js`
3. Opcional, recomendado: parar de versionar o banco antigo (o arquivo continua no seu disco):
   `git rm --cached src/database/database.sqlite`
4. `npm install`
5. `npm test` (esperado: 8 testes passando)
6. Opcional, para migrar os dados antigos: `DATABASE_FILE=./src/database/database.sqlite npm start` uma vez, depois `Ctrl+C` (horários corrompidos pelo bug antigo são descartados).
7. Simular produção: `PORT=5500 NODE_ENV=production TRUST_PROXY=1 DATABASE_FILE=./data/producao-local.sqlite npm start` (no Render o banco fica em `/tmp`; aqui vai para `data/`, que o Git ignora) e abrir `http://localhost:5500/health` (esperado: `{"status":"ok","connections":0,"proffys":0}`). `Ctrl+C` para sair.

### Etapa 2 · Subir para o GitHub

1. Ativar o CI (a pasta `.github` é protegida para a ferramenta que preparou o projeto, então o arquivo veio em `ci/`):
   `mkdir -p .github/workflows && mv ci/github-actions-ci.yml .github/workflows/ci.yml && rmdir ci`
2. `git status` (não podem aparecer `node_modules/`, `data/`, `.env` nem `src/database/database.sqlite` como arquivo novo)
3. `git add -A`
4. `git commit -m "feat(deploy): Node 22, SQLite em /tmp, deploy automático no Render e CI"`
5. `git push origin master`
6. No GitHub, aba **Actions**: o CI precisa ficar verde.

### Etapa 3 · Criar o serviço no Render

1. Entrar em **render.com** com a conta do GitHub e autorizar o repositório `proffy`.
2. **New → Blueprint** e escolher `douglasabnovato/proffy` (branch `master`).
3. Conferir o serviço `proffy`, plano **Free**, e as variáveis já preenchidas pelo blueprint: `NODE_VERSION=22`, `NODE_ENV=production`, `TRUST_PROXY=1`, `DATABASE_FILE=/tmp/proffy.sqlite`. Nenhum segredo é pedido.
4. **Apply** e acompanhar **Logs** até aparecer `Proffy em http://localhost:10000` (3 a 6 min; o `better-sqlite3` compila na primeira vez).

### Etapa 4 · Conferir no ar

1. `https://proffy.onrender.com/health` responde `{"status":"ok","connections":0,"proffys":0}`.
2. A home carrega com a ilustração e o total de conexões.
3. Em **Dar aulas**, cadastrar um professor **fictício** com 2 horários redireciona para a página de sucesso; `/health` passa a `proffys: 1`.
4. Em **Estudar**, filtrar pela matéria, dia e um horário dentro do intervalo mostra o professor; um horário igual ao fim do intervalo não mostra.
5. **Entrar em contato** abre o WhatsApp com a mensagem pronta e `/health` soma 1 em `connections`.
6. Uma URL inexistente (ex.: `/xyz`) mostra a página 404 própria.
7. Em **Manual Deploy → Restart service**, `/health` volta a zero (confirma o comportamento de disco temporário).

### Etapa 5 · Fechar

1. Se a URL real for diferente de `https://proffy.onrender.com`, corrigir no `Readme.md`, commit e push (o Render publica sozinho).
2. No GitHub, **About → Website**: colar a URL.
