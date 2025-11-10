/**
 * Migración: Crear tabla de refresh tokens
 * Creada: 2025-11-09T20:51:00.000Z
 */

/**
 * Ejecutar migración (aplicar cambios)
 */
async function up(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `;

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Tabla refresh_tokens creada');
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
        const sql = 'DROP TABLE IF EXISTS refresh_tokens';

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Tabla refresh_tokens eliminada');
                resolve();
            }
        });
    });
}

module.exports = { up, down };