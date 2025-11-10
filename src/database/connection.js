const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const MigrationManager = require('./MigrationManager');
const User = require('./models/User');
const RefreshToken = require('./models/RefreshToken');
require('dotenv').config();

/**
 * Database Connection Manager
 * Maneja la conexión, migraciones y modelos
 */
class Database {
    db = null;
    migrationManager = null;
    models = {
        User: null,
        RefreshToken: null
    };

    // Conectar a la base de datos y ejecutar migraciones
    async connect() {
        try {
            const dbPath = process.env.DB_PATH || './database.db';

            // Crear conexión
            this.db = await this.createConnection(dbPath);
            console.log('📦 Conectado a la base de datos SQLite');

            // Configurar WAL mode para mejor concurrencia
            await this.enableWalMode();

            // Inicializar manager de migraciones
            this.migrationManager = new MigrationManager(dbPath);
            await this.migrationManager.connect();

            // Ejecutar migraciones pendientes
            await this.migrationManager.runPendingMigrations();

            // Inicializar modelos
            this.initializeModels();

            console.log('✅ Base de datos configurada correctamente');

        } catch (error) {
            console.error('❌ Error conectando a la base de datos:', error);
            throw error;
        }
    }

    // Crear conexión a SQLite
    createConnection(dbPath) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(db);
                }
            });
        });
    }

    // Habilitar WAL mode (Write-Ahead Logging) para mejor rendimiento
    async enableWalMode() {
        return new Promise((resolve, reject) => {
            this.db.run('PRAGMA journal_mode=WAL', (err) => {
                if (err) {
                    console.warn('⚠️ No se pudo habilitar WAL mode:', err.message);
                    resolve(); // No es crítico, continuar
                } else {
                    console.log('⚡ WAL mode habilitado para mejor rendimiento');
                    resolve();
                }
            });
        });
    }

    // Inicializar modelos
    initializeModels() {
        this.models.User = new User(this.db);
        this.models.RefreshToken = new RefreshToken(this.db);
        console.log('🔧 Modelos inicializados');
    }

    // Obtener instancia de los modelos
    getModels() {
        if (!this.models.User || !this.models.RefreshToken) {
            throw new Error('Modelos no inicializados. Llama a connect() primero.');
        }
        return this.models;
    }

    // Utilidades para desarrollo
    async createMigration(name) {
        if (!this.migrationManager) {
            throw new Error('Migration manager no inicializado');
        }
        return this.migrationManager.createMigration(name);
    }

    // Obtener estadísticas de la base de datos
    async getStats() {
        try {
            const { User, RefreshToken } = this.getModels();
            const [userCount, tokenStats] = await Promise.all([
                User.count(),
                RefreshToken.getStats()
            ]);

            return {
                users: {
                    total: userCount
                },
                tokens: tokenStats
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Cerrar todas las conexiones
    close() {
        if (this.migrationManager) {
            this.migrationManager.close();
        }
        
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error cerrando la base de datos:', err.message);
                } else {
                    console.log('🔒 Conexión con la base de datos cerrada');
                }
            });
        }
    }

    // Ejecutar consulta personalizada (para casos especiales)
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                this.db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                this.db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ 
                        changes: this.changes, 
                        lastID: this.lastID 
                    });
                });
            }
        });
    }
}

// Exportar instancia singleton
module.exports = new Database();