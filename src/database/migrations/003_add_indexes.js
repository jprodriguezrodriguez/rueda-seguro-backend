/**
 * Migración: Agregar índices para optimizar consultas
 * Creada: 2025-11-09T20:52:00.000Z
 */

/**
 * Ejecutar migración (aplicar cambios)
 */
async function up(db) {
    return new Promise(async (resolve, reject) => {
        try {
            // Índice para email de usuarios (búsquedas frecuentes en login)
            await new Promise((res, rej) => {
                db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
                    if (err) rej(err);
                    else {
                        console.log('  Índice idx_users_email creado');
                        res();
                    }
                });
            });

            // Índice para username (búsquedas frecuentes)
            await new Promise((res, rej) => {
                db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)', (err) => {
                    if (err) rej(err);
                    else {
                        console.log('  Índice idx_users_username creado');
                        res();
                    }
                });
            });

            // Índice para refresh tokens activos
            await new Promise((res, rej) => {
                db.run('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens(token, is_active)', (err) => {
                    if (err) rej(err);
                    else {
                        console.log('  Índice idx_refresh_tokens_active creado');
                        res();
                    }
                });
            });

            // Índice para tokens por usuario
            await new Promise((res, rej) => {
                db.run('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)', (err) => {
                    if (err) rej(err);
                    else {
                        console.log('  Índice idx_refresh_tokens_user creado');
                        res();
                    }
                });
            });

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Revertir migración (deshacer cambios)
 */
async function down(db) {
    return new Promise(async (resolve, reject) => {
        try {
            // Eliminar índices
            const indexes = [
                'idx_users_email',
                'idx_users_username', 
                'idx_refresh_tokens_active',
                'idx_refresh_tokens_user'
            ];

            for (const indexName of indexes) {
                await new Promise((res, rej) => {
                    db.run(`DROP INDEX IF EXISTS ${indexName}`, (err) => {
                        if (err) rej(err);
                        else {
                            console.log(`  Índice ${indexName} eliminado`);
                            res();
                        }
                    });
                });
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { up, down };