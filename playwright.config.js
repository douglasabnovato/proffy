/* Teste de ponta a ponta no navegador: sobe o Proffy com um banco SQLite novo e percorre o fluxo no Chromium. O app não tem tema escuro próprio (nenhum CSS usa prefers-color-scheme), então há um projeto só */
const os = require("os");
const path = require("path");
const { defineConfig, devices } = require("@playwright/test");

const PORT = Number(process.env.E2E_PORT) || 5591;
const DATABASE_FILE = path.join(os.tmpdir(), `proffy-e2e-${Date.now()}.sqlite`);

module.exports = defineConfig({
  testDir: "e2e",
  testMatch: /.*\.e2e\.js$/,
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  /* Sem nova tentativa: o limite de 5 envios por minuto por IP vale também aqui */
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", reducedMotion: "reduce" },
  projects: [
    { name: "claro", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 }, colorScheme: "light" } },
  ],
  webServer: {
    command: "node src/server.js",
    url: `http://localhost:${PORT}/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { PORT: String(PORT), DATABASE_FILE },
  },
});
/* Fim de playwright.config.js */
