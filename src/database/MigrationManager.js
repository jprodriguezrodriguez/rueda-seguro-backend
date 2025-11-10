const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');

/**
 * Sistema de migraciones para SQLite
 * Permite versionar y ejecutar cambios en la base de datos de forma controlada
 */
class MigrationManager {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.migrationsPath = path.join(__dirname, 'migrations');
    }

    // Conectar a la base de datos
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('📦 Conexión a base de datos establecida');
                    resolve();
                }
            });
        });
    }

    // Crear tabla de migraciones si no existe
    async initializeMigrationsTable() {
        return new Promise((resolve, reject) => {
            const createMigrationsTable = `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createMigrationsTable, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('📋 Tabla de migraciones inicializada');
                    resolve();
                }
            });
        });
    }

    // Obtener migraciones ejecutadas
    async getExecutedMigrations() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT name FROM migrations ORDER BY id', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.name));
                }
            });
        });
    }

    // Marcar migración como ejecutada
    async markMigrationAsExecuted(migrationName) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO migrations (name) VALUES (?)', 
                [migrationName], 
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    // Obtener archivos de migración
    getMigrationFiles() {
        if (!fs.existsSync(this.migrationsPath)) {
            console.log('📁 No se encontró carpeta de migraciones');
            return [];
        }

        return fs.readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.js'))
            .sort(); // Ordenar por nombre (por eso usamos prefijos numericos)
    }

    // Ejecutar una migración
    async runMigration(migrationFile) {
        try {
            console.log(`🔄 Ejecutando migración: ${migrationFile}`);
            
            const migrationPath = path.join(this.migrationsPath, migrationFile);
            const migration = require(migrationPath);

            // Ejecutar la función up de la migración
            await migration.up(this.db);

            // Marcar como ejecutada
            await this.markMigrationAsExecuted(migrationFile);

            console.log(`✅ Migración completada: ${migrationFile}`);
        } catch (error) {
            console.error(`❌ Error en migración ${migrationFile}:`, error);
            throw error;
        }
    }

    // Ejecutar todas las migraciones pendientes
    async runPendingMigrations() {
        try {
            await this.initializeMigrationsTable();
            
            const executedMigrations = await this.getExecutedMigrations();
            const migrationFiles = this.getMigrationFiles();

            const pendingMigrations = migrationFiles.filter(
                file => !executedMigrations.includes(file)
            );

            if (pendingMigrations.length === 0) {
                console.log('✨ No hay migraciones pendientes');
                return;
            }

            console.log(`📊 Ejecutando ${pendingMigrations.length} migración(es) pendiente(s):`);

            for (const migrationFile of pendingMigrations) {
                await this.runMigration(migrationFile);
            }

            console.log('🎉 Todas las migraciones completadas exitosamente');

        } catch (error) {
            console.error('❌ Error ejecutando migraciones:', error);
            throw error;
        }
    }

    // Crear nueva migración
    createMigration(name) {
        const timestamp = new Date().toISOString().replaceAll(/[-:T]/g, '').slice(0, 14);
        const filename = `${timestamp}_${name}.js`;
        const filepath = path.join(this.migrationsPath, filename);

        const template = `/**
 * Migración: ${name}
 * Creada: ${new Date().toISOString()}
 */

/**
 * Ejecutar migración (aplicar cambios)
 */
async function up(db) {
    return new Promise((resolve, reject) => {
        // Ejemplo: Crear tabla
        const sql = \`
            CREATE TABLE IF NOT EXISTS ejemplo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        \`;

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
`;

        // Crear directorio si no existe
        if (!fs.existsSync(this.migrationsPath)) {
            fs.mkdirSync(this.migrationsPath, { recursive: true });
        }

        fs.writeFileSync(filepath, template);
        console.log(`📝 Nueva migración creada: ${filename}`);
        return filename;
    }

    // Cerrar conexión
    close() {
        if (this.db) {
            this.db.close();
            console.log('🔒 Conexión a base de datos cerrada');
        }
    }
}

module.exports = MigrationManager;