/* Validação do cadastro de aula e dos filtros de busca */
const { SUBJECTS, toMinutes } = require("../domain/catalog");

/* Garante array mesmo quando o formulário envia um único valor */
function asArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/* Valida o formulário "Dar aulas"; devolve { value, errors } */
function validateClass(body = {}) {
  const cost = Number(String(body.cost ?? "").replace(",", "."));
  const weekdays = asArray(body["weekday[]"] ?? body.weekday);
  const froms = asArray(body["time_from[]"] ?? body.time_from);
  const tos = asArray(body["time_to[]"] ?? body.time_to);
  const value = {
    proffy: {
      name: String(body.name ?? "").trim(),
      avatar: String(body.avatar ?? "").trim(),
      whatsapp: String(body.whatsapp ?? "").replace(/\D/g, ""),
      bio: String(body.bio ?? "").trim(),
    },
    klass: { subject: Number(body.subject), costCents: Math.round(cost * 100) },
    schedules: weekdays.map((weekday, i) => ({ weekday: Number(weekday), from: toMinutes(froms[i]), to: toMinutes(tos[i]) })),
  };
  const errors = {};
  const p = value.proffy;
  if (p.name.length < 3 || p.name.length > 80) errors.name = "Informe seu nome (3 a 80 caracteres).";
  if (!/^https:\/\/\S+$/.test(p.avatar)) errors.avatar = "Use um link de imagem que comece com https://.";
  if (p.whatsapp.length < 10 || p.whatsapp.length > 11) errors.whatsapp = "Informe DDD + número (10 ou 11 dígitos).";
  if (p.bio.length < 10 || p.bio.length > 600) errors.bio = "Escreva de 10 a 600 caracteres.";
  if (!(value.klass.subject >= 1 && value.klass.subject <= SUBJECTS.length)) errors.subject = "Escolha a matéria.";
  if (!(value.klass.costCents > 0 && value.klass.costCents <= 1000000)) errors.cost = "Informe o valor da hora/aula em reais.";
  const badSchedule = value.schedules.length === 0 || value.schedules.some((s) => !(s.weekday >= 0 && s.weekday <= 6) || !(s.to > s.from));
  if (badSchedule) errors.schedule = "Cada horário precisa de dia e de um intervalo em que o fim seja depois do início.";
  return { value, errors };
}

/* Valida os filtros da busca; devolve null se incompletos */
function parseFilters(query = {}) {
  const subject = Number(query.subject);
  const weekday = Number(query.weekday);
  const minutes = toMinutes(query.time);
  const complete = subject >= 1 && subject <= SUBJECTS.length && weekday >= 0 && weekday <= 6 && Number.isFinite(minutes);
  return complete ? { subject, weekday, minutes } : null;
}

module.exports = { validateClass, parseFilters };
/* Fim de validation.js */
