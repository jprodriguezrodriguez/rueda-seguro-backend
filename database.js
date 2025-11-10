const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const createModels = require('./src/database/models');
const MigrationManager = require('./src/database/MigrationManager');
require('dotenv').config();

class Database {
    db = null;
    models = null;

    // Conectar a la base de datos
    connect() {
        return new Promise((resolve, reject) => {
            const dbPath = process.env.DB_PATH || './database.db';

            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error al conectar con SQLite:', err.message);
                    reject(err);
                } else {
                    console.log('Conectado a la base de datos SQLite');
                    // Ejecutar migraciones pendientes
                    const migrationManager = new MigrationManager(dbPath);
                    migrationManager.db = this.db; // Reutilizar conexión existente

                    migrationManager.initializeMigrationsTable()
                        .then(() => migrationManager.runPendingMigrations())
                        .then(() => {
                            // Inicializar modelos con la conexión de BD
                            this.models = createModels(this.db);
                            resolve();
                        })
                        .catch(reject);
                }
            });
        });
    }

    // Obtener instancia de los modelos
    getModels() {
        if (!this.models) {
            throw new Error('Base de datos no conectada. Llama a connect() primero.');
        }
        return this.models;
    }

    // Cerrar conexión
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error cerrando la base de datos:', err.message);
                } else {
                    console.log('Conexión con la base de datos cerrada');
                }
            });
        }
    }
}

module.exports = new Database();