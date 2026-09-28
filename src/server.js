/* Ponto de entrada do Proffy */
const config = require("./config");
const { openDatabase } = require("./db/connection");
const { createRepository } = require("./repository");
const { createApp } = require("./app");

/* Abre o banco e sobe o servidor */
function main() {
  const repo = createRepository(openDatabase(config.databaseFile));
  createApp({ repo, trustProxy: config.trustProxy }).listen(config.port, () =>
    console.log(`Proffy em http://localhost:${config.port}`)
  );
}

main();
/* Fim de server.js */
