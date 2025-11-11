// src/database/migrations/006_create_reports_tables.js
async function up(db) {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS accident_types(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT
        );
        CREATE TABLE IF NOT EXISTS reports(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type_id INTEGER NOT NULL,
          is_severe INTEGER NOT NULL DEFAULT 0,
          message TEXT,
          photo_path TEXT,
          latitude REAL,
          longitude REAL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY(type_id) REFERENCES accident_types(id)
        );
      `;
      db.exec(sql, (err) => err ? reject(err) : resolve());
    });
}

async function down(db) {
    return new Promise((resolve, reject) => {
      db.exec(`DROP TABLE IF EXISTS reports; DROP TABLE IF EXISTS accident_types;`,
              (err) => err ? reject(err) : resolve());
    });
}

module.exports = { up, down };