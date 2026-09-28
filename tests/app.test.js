/* Testes do Proffy: conversão de horários, busca parametrizada, cadastro e conexões */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { openDatabase } = require("../src/db/connection");
const { createRepository } = require("../src/repository");
const { createApp } = require("../src/app");
const { toMinutes } = require("../src/domain/catalog");

/* App isolado com banco em memória */
function build() {
  const repo = createRepository(openDatabase(":memory:"));
  return { repo, app: createApp({ repo }) };
}

const form = {
  name: "Ana Lima",
  avatar: "https://example.com/ana.png",
  whatsapp: "(32) 98888-7777",
  bio: "Professora de matemática há 10 anos.",
  subject: "8",
  cost: "80,50",
  "weekday[]": ["1", "3"],
  "time_from[]": ["08:30", "14:00"],
  "time_to[]": ["12:00", "18:00"],
};

test("toMinutes corrige o bug de concatenação (08:30 = 510, não 48030)", () => {
  assert.equal(toMinutes("08:30"), 510);
  assert.equal(toMinutes("23:59"), 1439);
  assert.ok(Number.isNaN(toMinutes("25:00")));
});

test("cadastro com dois horários grava em transação e redireciona", async () => {
  const { app, repo } = build();
  await request(app).post("/give-classes").type("form").send(form).expect(303);
  const found = repo.search({ subject: 8, weekday: 3, minutes: toMinutes("15:00") });
  assert.equal(found.length, 1);
  assert.equal(found[0].cost_cents, 8050);
  assert.equal(found[0].whatsapp, "32988887777");
});

test("busca respeita o intervalo [início, fim)", async () => {
  const { app } = build();
  await request(app).post("/give-classes").type("form").send(form);
  const inside = await request(app).get("/study").query({ subject: 8, weekday: 1, time: "11:59" }).expect(200);
  assert.match(inside.text, /Ana Lima/);
  assert.match(inside.text, /R\$\s80,50/);
  const edge = await request(app).get("/study").query({ subject: 8, weekday: 1, time: "12:00" }).expect(200);
  assert.match(edge.text, /Nenhum professor encontrado/);
});

test("filtro com tentativa de injeção SQL não quebra nem vaza dados", async () => {
  const { app } = build();
  await request(app).post("/give-classes").type("form").send(form);
  const res = await request(app).get("/study").query({ subject: "8' OR '1'='1", weekday: 1, time: "09:00" }).expect(200);
  assert.doesNotMatch(res.text, /Ana Lima/);
});

test("um único horário (sem array) também é aceito", async () => {
  const { app, repo } = build();
  await request(app).post("/give-classes").type("form")
    .send({ ...form, "weekday[]": "2", "time_from[]": "19:00", "time_to[]": "21:00" }).expect(303);
  assert.equal(repo.search({ subject: 8, weekday: 2, minutes: toMinutes("20:00") }).length, 1);
});

test("dados inválidos respondem 422 com mensagens", async () => {
  const { app } = build();
  const res = await request(app).post("/give-classes").type("form")
    .send({ ...form, avatar: "javascript:alert(1)", whatsapp: "123", "time_to[]": ["08:00", "18:00"] }).expect(422);
  assert.match(res.text, /https:\/\//);
  assert.match(res.text, /DDD \+ número/);
  assert.match(res.text, /fim seja depois do início/);
});

test("contato conta a conexão e redireciona ao WhatsApp com texto codificado", async () => {
  const { app, repo } = build();
  await request(app).post("/give-classes").type("form").send(form);
  const [{ class_id: id }] = repo.search({ subject: 8, weekday: 1, minutes: 600 });
  const res = await request(app).get(`/contact/${id}`).expect(302);
  assert.match(res.headers.location, /^https:\/\/wa\.me\/5532988887777\?text=Ol%C3%A1/);
  assert.equal(repo.stats().connections, 1);
  const home = await request(app).get("/").expect(200);
  assert.match(home.text, /1 conexão realizada/);
  await request(app).get("/contact/999").expect(404);
});

test("migração corrige matéria em texto e descarta horários corrompidos", () => {
  const Database = require("better-sqlite3");
  const file = require("path").join(require("os").tmpdir(), `proffy-legado-${Date.now()}.sqlite`);
  const legacy = new Database(file);
  legacy.exec(`CREATE TABLE proffys (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, avatar TEXT, whatsapp TEXT, bio TEXT);
    CREATE TABLE classes (id INTEGER PRIMARY KEY AUTOINCREMENT, subject INTEGER, cost TEXT, proffy_id INTEGER);
    CREATE TABLE class_schedule (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER, weekday INTEGER, time_from INTEGER, time_to);
    INSERT INTO proffys VALUES (1,'Diego Fernandes','https://x/a.png','32988887777','Entusiasta de química avançada.');
    INSERT INTO classes VALUES (1,'Química','20',1);
    INSERT INTO class_schedule VALUES (1,1,1,720,'1220'), (2,1,6,69010,'151810');`);
  legacy.close();
  const repo = createRepository(openDatabase(file));
  assert.equal(repo.search({ subject: 10, weekday: 1, minutes: 800 }).length, 1);
  assert.equal(repo.search({ subject: 10, weekday: 6, minutes: 800 }).length, 0);
});
/* Fim de app.test.js */
