# Deploy · Proffy

> Revisto em 15/11/2026. **Estado: não publicado.** O serviço no Render ainda não foi criado; criar é do responsável (#26). O endereço `https://proffy.onrender.com` responde, mas serve o projeto de outra pessoa (`theme-color` `#2E6D6E`, conferido com `curl` em 15/11/2026). Por isso o `render.yaml` usa o nome `proffy-estudo`.

## 1. Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render, 1 web service Free (escolhida)** | Roda o servidor Express; o Blueprint `render.yaml` já está no repositório; publica a cada push na `master` |
| GitHub Pages | Não serve: só publica arquivos estáticos, e o projeto tem servidor Express e banco |
| Netlify ou Vercel | Não mantêm um servidor Express contínuo com SQLite em disco |
| VPS ou disco persistente pago | Fora da regra do portfólio (só hospedagem gratuita) |

O Proffy não usa MongoDB: o banco é SQLite (`better-sqlite3`) num arquivo. Não há usuário de banco nem segredo a criar.

## 2. O que o `render.yaml` faz

| Chave | Valor | Por quê |
|---|---|---|
| `name` | `proffy-estudo` | O nome `proffy` já é de outra conta |
| `plan` | `free` | Só ambiente gratuito |
| `buildCommand` / `startCommand` | `npm ci` / `npm start` | Os mesmos do `package.json` |
| `healthCheckPath` | `/health` | Lê o banco: devolve `{"status":"ok","connections":N,"proffys":N}` |
| `autoDeployTrigger` | `commit` | Cada push na `master` publica |
| `NODE_VERSION` | `22` | A mesma versão do CI |
| `NODE_ENV` | `production` | O `npm ci` não instala Playwright nem supertest |
| `TRUST_PROXY` | `1` | Sem isso, o limite de 5 envios por minuto contaria todos os visitantes como um IP só (o do proxy) |
| `DATABASE_FILE` | `/tmp/proffy.sqlite` | Caminho gravável no Render |

## 3. Limites do plano gratuito

- **O banco volta vazio** a cada deploy, reinício ou quando o serviço dorme: o disco do Render Free é temporário ([Render: plano gratuito](https://render.com/docs/free)).
- O serviço dorme depois de 15 minutos sem acesso e leva cerca de 1 minuto para acordar.
- As horas gratuitas são da conta inteira do Render.

## 4. Segurança e dados pessoais

- O cadastro publica nome, foto, biografia e WhatsApp. O formulário avisa. Numa demonstração, use só dados fictícios (ex.: "Ana Teste", WhatsApp `11900000001`, foto `https://imagens.empresa.test/ana.png`).
- Não há login nem como o professor apagar o próprio cadastro. O reinício do serviço apaga tudo, mas isso não substitui o direito de eliminação da LGPD num uso real.
- Limite de 5 envios por minuto por IP, HTML escapado, foto só por link `https://`, consultas parametrizadas e `helmet` com CSP.

## 5. Passo a passo (responsável)

### Etapa 1 · Conferir localmente (Git Bash)

1. `git clone -c core.longpaths=true https://github.com/douglasabnovato/proffy && cd proffy`
2. `npm ci` (o `better-sqlite3` 13 traz o binário pronto; nada é compilado)
3. `npm test`: 15 testes passando.
4. `npx playwright install chromium` e `npm run test:e2e`: 3 testes passando. O app não tem tema escuro próprio, então o teste roda só no modo claro.
5. Simular produção: `PORT=5500 NODE_ENV=production TRUST_PROXY=1 DATABASE_FILE=./data/producao-local.sqlite npm start` e abrir `http://localhost:5500/health`. Esperado: `{"status":"ok","connections":0,"proffys":0}`. `Ctrl+C` para sair.

### Etapa 2 · Criar o serviço no Render

1. Entrar em <https://dashboard.render.com> com a conta do GitHub.
2. Botão **New** (alto da tela) → **Blueprint**.
3. Em **Connect a repository**, escolher `douglasabnovato/proffy`. Se não aparecer, clicar em **Configure account** e liberar o repositório para o Render.
4. **Branch:** `master`. **Blueprint Name:** `proffy`.
5. Conferir na lista o serviço `proffy-estudo`, tipo **Web Service**, plano **Free**. Nenhuma variável pede valor: o Blueprint não tem segredo.
6. Clicar em **Deploy Blueprint** (ou **Apply**) e abrir o serviço → **Logs**. Esperar a linha `Proffy em http://localhost:10000` (3 a 6 minutos; o `better-sqlite3` compila na primeira vez).

### Etapa 3 · Conferir o endereço real

1. No topo da página do serviço, copiar o endereço `https://proffy-estudo....onrender.com`. O Render pode acrescentar um sufixo se o nome já existir.
2. `curl -s https://<endereço>/health`: esperado `{"status":"ok","connections":0,"proffys":0}`.
3. `curl -s https://<endereço>/ | grep theme-color`: esperado `#8257e5`, o do `src/views/_head.html`. Outro valor indica que o site não é o nosso.

### Etapa 4 · Conferir o fluxo no ar

1. **Dar aulas**: cadastrar um professor fictício com 2 horários; a tela mostra "Cadastro concluído!" e `/health` passa a `proffys: 1`.
2. **Estudar**: só a matéria mostra o cartão com os 2 horários; quarta 15:00 acha, quarta 18:00 não acha; "Até R$" abaixo do preço não acha.
3. **Entrar em contato** abre o WhatsApp com a mensagem pronta, e `/health` soma 1 em `connections`.
4. `/xyz` mostra a página 404 própria.

### Etapa 5 · Fechar

1. Comentar na #26 o endereço real e a saída do `curl` de `/health`.
2. Pedir num PR o link no README (seção "Em produção") e em **About → Website** no GitHub (engrenagem ao lado de "About").

## 6. Se algo falhar

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Build falha em `better-sqlite3` | Node diferente do 22 | Conferir `NODE_VERSION=22` em **Environment** |
| `/health` dá 502 por 1 minuto | Serviço acordando | Esperar e repetir |
| Professores somem | Disco temporário do plano Free | Comportamento esperado; banco persistente é outra decisão |
| Cadastro dá 429 | Limite de 5 envios por minuto por IP | Esperar 1 minuto |
