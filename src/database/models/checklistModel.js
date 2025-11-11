// src/database/models/ChecklistModel.js
class ChecklistModel {
  constructor(dbLike) {
    // Si te pasaron el wrapper (tiene .db y .query), lo guardamos
    // Si te pasaron el sqlite3.Database crudo, lo tratamos igual
    this.wrapper = (dbLike && dbLike.db && typeof dbLike.query === 'function') ? dbLike : null;
    this.conn = this.wrapper ? this.wrapper.db : dbLike;

    this.seed = [
      { category: 'Llantas y ruedas', question: '¿La presión de las dos llantas está en rango?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Llantas y ruedas', question: '¿El dibujo de las llantas se ve bien?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Llantas y ruedas', question: '¿No hay cortes, clavos o bultos?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Llantas y ruedas', question: '¿El rin se ve recto y sin golpes?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Llantas y ruedas', question: '¿Las tapas de válvula están puestas?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Frenos y suspensión', question: '¿El freno delantero se siente firme?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Frenos y suspensión', question: '¿El freno trasero responde normal?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Frenos y suspensión', question: '¿Aún queda material en pastillas/zapatas?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Frenos y suspensión', question: '¿Los discos/tambores no están agrietados ni doblados?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Frenos y suspensión', question: '¿La suspensión no pierde aceite y rebota normal?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Transmisión', question: '¿La cadena tiene la holgura correcta? (~2–3 cm)', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Transmisión', question: '¿La cadena está lubricada?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Transmisión', question: '¿Piñón y corona no tienen dientes “afilados”?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Motor y fluidos', question: '¿El nivel de aceite es correcto?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Motor y fluidos', question: '(Si aplica) ¿El refrigerante está entre marcas?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Motor y fluidos', question: '¿Tienes suficiente combustible para el trayecto?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Motor y fluidos', question: '¿No ves fugas debajo del motor?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Luces, señales y sonido', question: '¿Funciona la luz delantera (baja/alta)?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Luces, señales y sonido', question: '¿Enciende el stop con ambos frenos?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Luces, señales y sonido', question: '¿Funcionan las direccionales (adelante y atrás)?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Luces, señales y sonido', question: '¿Suena el claxon claramente?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Luces, señales y sonido', question: '¿Los espejos están limpios y bien ajustados?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Controles y ergonomía', question: '¿El acelerador retorna solo sin trabarse?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Controles y ergonomía', question: '¿El embrague tiene juego libre correcto?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' },
      { category: 'Controles y ergonomía', question: '¿Palancas/pedales y cables se ven en buen estado?', hint: 'Pista para el usuario por si no sabe cómo revisarlo' }
    ];
  }

  // ---------- Helpers compatibles ----------
  _queryAll(sql, params = []) {
    if (this.wrapper && typeof this.wrapper.query === 'function') {
      // usa Database.query(sql, params)
      return this.wrapper.query(sql, params);
    }
    // sqlite3.Database: usa .all
    return new Promise((resolve, reject) => {
      this.conn.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
  }

  _run(sql, params = []) {
    if (this.wrapper && typeof this.wrapper.query === 'function') {
      // para INSERT/UPDATE/DELETE tu wrapper ya resuelve
      return this.wrapper.query(sql, params);
    }
    return new Promise((resolve, reject) => {
      this.conn.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  _exec(sql) {
    // exec múltiple statements
    return new Promise((resolve, reject) => {
      this.conn.exec(sql, (err) => err ? reject(err) : resolve());
    });
  }

  // ---------- API del modelo ----------
  async initialize() {
    await this._exec(`
      CREATE TABLE IF NOT EXISTS checklist_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        hint TEXT
      );
      CREATE TABLE IF NOT EXISTS checklist_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        response INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES checklist_questions(id)
      );
    `);

    const rows = await this._queryAll('SELECT COUNT(*) AS c FROM checklist_questions');
    if (rows[0].c === 0) {
      for (const q of this.seed) {
        await this._run(
          'INSERT INTO checklist_questions (category, question, hint) VALUES (?, ?, ?)',
          [q.category, q.question, q.hint]
        );
      }
      console.log('✅ Seed de checklist insertado');
    }
  }

  getRandomQuestions(limit = 4) {
    return this._queryAll(
      'SELECT id, category, question, hint FROM checklist_questions ORDER BY RANDOM() LIMIT ?',
      [limit]
    );
  }

  mapResponse(value) {
    if (value == null) return -1;
    const v = String(value).trim().toUpperCase();
    if (v === 'SÍ' || v === 'SI') return 1;
    if (v === 'NO') return 0;
    return -1;
  }

  async saveResponses(userId, questionsList) {
    const ts = new Date().toISOString();
    for (const item of questionsList) {
      const qid = item.id || item.question_id;
      const r = this.mapResponse(item.user_response);
      await this._run(
        'INSERT INTO checklist_responses (user_id, question_id, response, timestamp) VALUES (?,?,?,?)',
        [userId, qid, r, ts]
      );
    }
    return ts;
  }

  getPendingByUser(userId) {
    return this._queryAll(
      `SELECT q.id, q.category, q.question, r.response, r.timestamp
         FROM checklist_responses r
         JOIN checklist_questions q ON q.id = r.question_id
        WHERE r.user_id = ? AND r.response <> 1
        ORDER BY r.timestamp DESC`,
      [userId]
    );
  }
}

module.exports = ChecklistModel;
