/**
 * Modelo User - Maneja todas las operaciones relacionadas con usuarios
 */
class User {
    constructor(db) {
        this.db = db;
    }

    // Crear un nuevo usuario
    async create(username, email, hashedPassword) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
            
            this.db.run(sql, [username, email, hashedPassword], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        username, 
                        email,
                        created_at: new Date().toISOString()
                    });
                }
            });
        });
    }

    // Buscar usuario por email
    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = ? AND is_active = 1`;
            
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Buscar usuario por username
    async findByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE username = ? AND is_active = 1`;
            
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Buscar usuario por ID (sin contraseña para seguridad)
    async findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, username, email, created_at, last_login, is_active 
                FROM users 
                WHERE id = ? AND is_active = 1
            `;
            
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Buscar usuario por ID con contraseña (solo para operaciones internas)
    async findByIdWithPassword(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE id = ? AND is_active = 1`;
            
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Actualizar último login
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
            
            this.db.run(sql, [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Actualizar contraseña
    async updatePassword(userId, hashedPassword) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET password = ? WHERE id = ?`;
            
            this.db.run(sql, [hashedPassword, userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Desactivar usuario (soft delete)
    async deactivate(userId) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET is_active = 0 WHERE id = ?`;
            
            this.db.run(sql, [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Listar usuarios (para administración)
    async list(limit = 10, offset = 0) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, username, email, created_at, last_login, is_active 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `;
            
            this.db.all(sql, [limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Contar total de usuarios
    async count() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as total FROM users WHERE is_active = 1`;
            
            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.total);
                }
            });
        });
    }
}

module.exports = User;