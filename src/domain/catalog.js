/* Catálogo fixo de matérias e dias da semana e conversão de horários (HH:MM ↔ minutos) */
const SUBJECTS = ["Artes", "Biologia", "Ciências", "Educação Física", "Física", "Geografia", "História", "Matemática", "Português", "Química"];
const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/* Nome da matéria pelo código 1..10 */
function subjectName(code) {
  return SUBJECTS[Number(code) - 1] || "Matéria";
}

/* "08:30" → 510; devolve NaN para formato inválido */
function toMinutes(time) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(time ?? "").trim());
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/* 510 → "08:30" */
function toHHMM(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

module.exports = { SUBJECTS, WEEKDAYS, subjectName, toMinutes, toHHMM };
/* Fim de catalog.js */
