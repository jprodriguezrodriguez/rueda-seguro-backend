/**
 * Modelo RefreshToken - Maneja todas las operaciones relacionadas con refresh tokens
 */
class RefreshToken {
    constructor(db) {
        this.db = db;
    }

    // Crear un nuevo refresh token
    async create(userId, token, expiresAt) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;
            
            this.db.run(sql, [userId, token, expiresAt], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        userId, 
                        token,
                        expiresAt,
                        created_at: new Date().toISOString()
                    });
                }
            });
        });
    }

    // Obtener refresh token válido con datos del usuario
    async findValidToken(token) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT rt.*, u.username, u.email 
                FROM refresh_tokens rt 
                INNER JOIN users u ON rt.user_id = u.id 
                WHERE rt.token = ? 
                AND rt.is_active = 1 
                AND rt.expires_at > datetime('now') 
                AND u.is_active = 1
            `;
            
            this.db.get(sql, [token], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Invalidar un refresh token específico
    async invalidate(token) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE refresh_tokens SET is_active = 0 WHERE token = ?`;
            
            this.db.run(sql, [token], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Invalidar todos los refresh tokens de un usuario
    async invalidateAllForUser(userId) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE refresh_tokens SET is_active = 0 WHERE user_id = ?`;
            
            this.db.run(sql, [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Limpiar tokens expirados (tarea de mantenimiento)
    async cleanExpired() {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM refresh_tokens WHERE expires_at < datetime('now')`;
            
            this.db.run(sql, [], function(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log(`🧹 Limpiados ${this.changes} refresh tokens expirados`);
                    resolve(this.changes);
                }
            });
        });
    }

    // Obtener tokens activos de un usuario
    async getActiveTokensForUser(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, token, expires_at, created_at 
                FROM refresh_tokens 
                WHERE user_id = ? 
                AND is_active = 1 
                AND expires_at > datetime('now')
                ORDER BY created_at DESC
            `;
            
            this.db.all(sql, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Estadísticas de tokens (para monitoreo)
    async getStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_tokens,
                    COUNT(CASE WHEN is_active = 1 AND expires_at > datetime('now') THEN 1 END) as active_tokens,
                    COUNT(CASE WHEN expires_at <= datetime('now') THEN 1 END) as expired_tokens,
                    COUNT(CASE WHEN is_active = 0 THEN 1 END) as invalidated_tokens
                FROM refresh_tokens
            `;
            
            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}

module.exports = RefreshToken;