/**
 * Migración: add_user_profile_fields
 * Creada: 2025-11-09T20:52:19.019Z
 */

/**
 * Ejecutar migración (aplicar cambios)
 */
async function up(db) {
    return new Promise((resolve, reject) => {
        // Ejemplo: Crear tabla
        const sql = `
            CREATE TABLE IF NOT EXISTS ejemplo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Tabla ejemplo creada');
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
        // Ejemplo: Eliminar tabla
        const sql = 'DROP TABLE IF EXISTS ejemplo';

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Tabla ejemplo eliminada');
                resolve();
            }
        });
    });
}

module.exports = { up, down };
