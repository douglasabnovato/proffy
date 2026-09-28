/* Consultas do Proffy com parâmetros (sem SQL montado por string) */
const { subjectName } = require("./domain/catalog");

/* Cria o repositório sobre uma conexão better-sqlite3 */
function createRepository(db) {
  const insertProffy = db.prepare("INSERT INTO proffys (name, avatar, whatsapp, bio) VALUES (@name, @avatar, @whatsapp, @bio)");
  const insertClass = db.prepare("INSERT INTO classes (subject, cost_cents, proffy_id) VALUES (@subject, @costCents, @proffyId)");
  const insertSchedule = db.prepare("INSERT INTO class_schedule (class_id, weekday, time_from, time_to) VALUES (@classId, @weekday, @from, @to)");
  const search = db.prepare(`
    SELECT c.id AS class_id, c.subject, c.cost_cents, p.name, p.avatar, p.whatsapp, p.bio
    FROM classes c JOIN proffys p ON p.id = c.proffy_id
    WHERE c.subject = @subject
      AND EXISTS (SELECT 1 FROM class_schedule s WHERE s.class_id = c.id AND s.weekday = @weekday
                  AND s.time_from <= @minutes AND s.time_to > @minutes)
    ORDER BY c.cost_cents, p.name LIMIT 50`);
  const contact = db.prepare("SELECT c.id, c.subject, p.name, p.whatsapp FROM classes c JOIN proffys p ON p.id = c.proffy_id WHERE c.id = ?");
  const addConnection = db.prepare("UPDATE classes SET connections = connections + 1 WHERE id = ?");
  const totalConnections = db.prepare("SELECT coalesce(sum(connections), 0) AS total FROM classes");
  const totalProffys = db.prepare("SELECT count(*) AS total FROM proffys");

  return {
    /* Cadastra professor, aula e horários numa única transação */
    createClass: db.transaction(({ proffy, klass, schedules }) => {
      const proffyId = Number(insertProffy.run(proffy).lastInsertRowid);
      const classId = Number(insertClass.run({ ...klass, proffyId }).lastInsertRowid);
      schedules.forEach((s) => insertSchedule.run({ ...s, classId }));
      return classId;
    }),
    search: (filters) => search.all(filters).map((row) => ({ ...row, subjectName: subjectName(row.subject) })),
    findContact: (classId) => contact.get(classId),
    registerConnection: (classId) => addConnection.run(classId).changes === 1,
    stats: () => ({ connections: totalConnections.get().total, proffys: totalProffys.get().total }),
  };
}

module.exports = { createRepository };
/* Fim de repository.js */
