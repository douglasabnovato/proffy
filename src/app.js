/* Aplicação Express do Proffy: landing, busca de professores, cadastro de aulas e contagem de conexões */
const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { SUBJECTS, WEEKDAYS, subjectName } = require("./domain/catalog");
const { validateClass, parseFilters } = require("./lib/validation");

/* Monta o app com o repositório injetado */
function createApp({ repo, trustProxy = false }) {
  const app = express();
  if (trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "https:", "data:"],
          "style-src": ["'self'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "script-src": ["'self'"],
        },
      },
    })
  );
  app.use(express.static(path.join(__dirname, "..", "public"), { maxAge: "1h" }));
  app.use(express.urlencoded({ extended: false, limit: "20kb" }));
  const env = nunjucks.configure(path.join(__dirname, "views"), { express: app, autoescape: true });
  env.addFilter("brl", (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

  const writeLimiter = rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false });
  const base = { subjects: SUBJECTS, weekdays: WEEKDAYS };

  app.get("/health", (req, res) => res.json({ status: "ok", ...repo.stats() }));

  app.get("/", (req, res) => res.render("index.html", { stats: repo.stats() }));

  app.get("/study", (req, res) => {
    const filters = parseFilters(req.query);
    const proffys = filters ? repo.search(filters) : null;
    res.render("study.html", { ...base, filters: req.query, searched: Boolean(filters), proffys });
  });

  app.get("/give-classes", (req, res) => res.render("give-classes.html", { ...base, form: {}, errors: {} }));

  app.post(["/give-classes", "/save-classes"], writeLimiter, (req, res) => {
    const { value, errors } = validateClass(req.body);
    if (Object.keys(errors).length) {
      return res.status(422).render("give-classes.html", { ...base, form: req.body, errors });
    }
    repo.createClass(value);
    return res.redirect(303, "/success");
  });

  app.get("/success", (req, res) => res.render("success.html"));

  app.get("/contact/:classId", (req, res) => {
    const contact = repo.findContact(Number(req.params.classId));
    if (!contact) return res.status(404).render("error.html", { status: 404, message: "Aula não encontrada." });
    repo.registerConnection(contact.id);
    const text = `Olá, ${contact.name}! Tenho interesse na sua aula de ${subjectName(contact.subject)}.`;
    return res.redirect(302, `https://wa.me/55${contact.whatsapp}?text=${encodeURIComponent(text)}`);
  });

  app.use((req, res) => res.status(404).render("error.html", { status: 404, message: "Página não encontrada." }));

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    return res.status(500).render("error.html", { status: 500, message: "Algo deu errado. Tente novamente em instantes." });
  });

  return app;
}

module.exports = { createApp };
/* Fim de app.js */
