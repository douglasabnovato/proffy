/* SQLite com migrations (PRAGMA user_version): normaliza o schema legado e descarta horários corrompidos */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { SUBJECTS } = require("../domain/catalog");

const subjectCase = SUBJECTS.map((name, i) => `WHEN '${name}' THEN ${i + 1}`).join(" ");

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS proffys (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, avatar TEXT, whatsapp TEXT, bio TEXT);
   CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY AUTOINCREMENT, subject INTEGER, cost TEXT, proffy_id INTEGER);
   CREATE TABLE IF NOT EXISTS class_schedule (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER, weekday INTEGER, time_from INTEGER, time_to);`,
  `CREATE TABLE proffys_v2 (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL CHECK (length(name) BETWEEN 3 AND 80),
     avatar TEXT NOT NULL,
     whatsapp TEXT NOT NULL CHECK (length(whatsapp) BETWEEN 10 AND 11),
     bio TEXT NOT NULL CHECK (length(bio) BETWEEN 10 AND 600),
     created_at TEXT NOT NULL DEFAULT (datetime('now')));
   CREATE TABLE classes_v2 (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     subject INTEGER NOT NULL CHECK (subject BETWEEN 1 AND ${SUBJECTS.length}),
     cost_cents INTEGER NOT NULL CHECK (cost_cents > 0),
     proffy_id INTEGER NOT NULL REFERENCES proffys(id) ON DELETE CASCADE,
     connections INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE class_schedule_v2 (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
     weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
     time_from INTEGER NOT NULL CHECK (time_from BETWEEN 0 AND 1439),
     time_to INTEGER NOT NULL CHECK (time_to BETWEEN 1 AND 1440 AND time_to > time_from));
   INSERT INTO proffys_v2 (id, name, avatar, whatsapp, bio)
     SELECT id, trim(name), avatar, whatsapp, bio FROM proffys
     WHERE length(trim(coalesce(name,''))) BETWEEN 3 AND 80 AND avatar LIKE 'https://%'
       AND length(whatsapp) BETWEEN 10 AND 11 AND whatsapp NOT GLOB '*[^0-9]*'
       AND length(coalesce(bio,'')) BETWEEN 10 AND 600;
   INSERT INTO classes_v2 (id, subject, cost_cents, proffy_id)
     SELECT c.id, CASE WHEN typeof(c.subject) = 'integer' OR c.subject GLOB '[0-9]*' THEN CAST(c.subject AS INTEGER) ELSE CASE c.subject ${subjectCase} END END,
            CAST(round(CAST(replace(c.cost, ',', '.') AS REAL) * 100) AS INTEGER), c.proffy_id
     FROM classes c JOIN proffys_v2 p ON p.id = c.proffy_id
     WHERE CAST(replace(c.cost, ',', '.') AS REAL) > 0
       AND (CASE WHEN typeof(c.subject) = 'integer' OR c.subject GLOB '[0-9]*' THEN CAST(c.subject AS INTEGER) ELSE CASE c.subject ${subjectCase} END END) BETWEEN 1 AND ${SUBJECTS.length};
   INSERT INTO class_schedule_v2 (id, class_id, weekday, time_from, time_to)
     SELECT s.id, s.class_id, s.weekday, CAST(s.time_from AS INTEGER), CAST(s.time_to AS INTEGER)
     FROM class_schedule s JOIN classes_v2 c ON c.id = s.class_id
     WHERE CAST(s.time_from AS INTEGER) BETWEEN 0 AND 1439 AND CAST(s.time_to AS INTEGER) BETWEEN 1 AND 1440
       AND CAST(s.time_to AS INTEGER) > CAST(s.time_from AS INTEGER) AND s.weekday BETWEEN 0 AND 6;
   DROP TABLE class_schedule; DROP TABLE classes; DROP TABLE proffys;
   ALTER TABLE proffys_v2 RENAME TO proffys;
   ALTER TABLE classes_v2 RENAME TO classes;
   ALTER TABLE class_schedule_v2 RENAME TO class_schedule;
   CREATE INDEX idx_classes_subject ON classes(subject);
   CREATE INDEX idx_schedule_lookup ON class_schedule(class_id, weekday, time_from, time_to);`,
];

/* Abre o banco e aplica as migrations pendentes */
function openDatabase(file) {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = OFF");
  const current = db.pragma("user_version", { simple: true });
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
  db.pragma("foreign_keys = ON");
  return db;
}

module.exports = { openDatabase };
/* Fim de connection.js */
