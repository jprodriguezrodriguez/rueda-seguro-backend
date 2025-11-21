/**
 * Migración: Crear tabla de usuarios
 * Creada: 2025-11-09T20:50:00.000Z
 */

/**
 * Ejecutar migración (aplicar cambios)
 */
async function up(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                is_active BOOLEAN DEFAULT 1
            )
        `;

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('  Tabla users creada');
                resolve();
            }
        });
    });
}

/**
 * Revertir migración (deshacer cambios)
 */
async function down(db) {
    return new Promise((resolve, reject) => {
        const sql = 'DROP TABLE IF EXISTS users';

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('  Tabla users eliminada');
                resolve();
            }
        });
    });
}

module.exports = { up, down };