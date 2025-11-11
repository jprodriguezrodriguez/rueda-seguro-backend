async function up(db) {
    return new Promise((resolve, reject) => {
        const sql = `
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
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (question_id) REFERENCES checklist_questions(id)
            );
        `;
        db.exec(sql, (err) => err ? reject(err) : resolve());
    });
}

async function down(db) {
    return new Promise((resolve, reject) => {
        db.exec(`
            DROP TABLE IF EXISTS checklist_responses;
            DROP TABLE IF EXISTS checklist_questions;
        `, (err) => err ? reject(err) : resolve());
    });
}

module.exports = { up, down };