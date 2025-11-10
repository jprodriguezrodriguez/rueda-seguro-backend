#!/usr/bin/env node

/**
 * CLI para gestionar base de datos y migraciones
 * 
 * Uso:
 *   node cli-db.js migrate              # Ejecutar migraciones pendientes
 *   node cli-db.js create-migration nombre  # Crear nueva migración
 *   node cli-db.js stats                # Mostrar estadísticas
 *   node cli-db.js reset                # Resetear base de datos (PELIGROSO)
 */

const MigrationManager = require('./src/database/MigrationManager');
const Database = require('./src/database/connection');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

class DatabaseCLI {
    constructor() {
        this.dbPath = process.env.DB_PATH || './database.db';
        this.commands = {
            'migrate': this.runMigrations.bind(this),
            'create-migration': this.createMigration.bind(this),
            'stats': this.showStats.bind(this),
            'reset': this.resetDatabase.bind(this),
            'help': this.showHelp.bind(this)
        };
    }

    async run(args) {
        const command = args[0];
        const subArgs = args.slice(1);

        if (!command || command === 'help') {
            this.showHelp();
            return;
        }

        if (!this.commands[command]) {
            console.error(`❌ Comando desconocido: ${command}`);
            this.showHelp();
            process.exit(1);
        }

        try {
            await this.commands[command](subArgs);
        } catch (error) {
            console.error('❌ Error ejecutando comando:', error.message);
            process.exit(1);
        }
    }

    // Ejecutar migraciones
    async runMigrations() {
        console.log('🚀 Ejecutando migraciones...\n');
        
        const migrationManager = new MigrationManager(this.dbPath);
        await migrationManager.connect();
        await migrationManager.runPendingMigrations();
        migrationManager.close();

        console.log('\n✅ Migraciones completadas');
    }

    // Crear nueva migración
    async createMigration(args) {
        if (args.length === 0) {
            console.error('❌ Debes proporcionar un nombre para la migración');
            console.log('Uso: node cli-db.js create-migration nombre_de_migracion');
            return;
        }

        const name = args.join('_').toLowerCase();
        const migrationManager = new MigrationManager(this.dbPath);
        
        const filename = migrationManager.createMigration(name);
        console.log(`✅ Migración creada: ${filename}`);
    }

    // Mostrar estadísticas
    async showStats() {
        console.log('📊 Estadísticas de la base de datos\n');

        await Database.connect();
        const stats = await Database.getStats();
        Database.close();

        console.log('👥 Usuarios:');
        console.log(`   Total: ${stats.users.total}`);
        
        console.log('\n🔑 Refresh Tokens:');
        console.log(`   Total: ${stats.tokens.total_tokens}`);
        console.log(`   Activos: ${stats.tokens.active_tokens}`);
        console.log(`   Expirados: ${stats.tokens.expired_tokens}`);
        console.log(`   Invalidados: ${stats.tokens.invalidated_tokens}`);

        // Tamaño de base de datos
        if (fs.existsSync(this.dbPath)) {
            const fileStat = fs.statSync(this.dbPath);
            const sizeInKB = (fileStat.size / 1024).toFixed(2);
            console.log(`\n💾 Base de datos:`);
            console.log(`   Archivo: ${this.dbPath}`);
            console.log(`   Tamaño: ${sizeInKB} KB`);
        }
    }

    // Resetear base de datos (PELIGROSO)
    async resetDatabase() {
        console.log('⚠️  PELIGRO: Esto eliminará TODA la base de datos');
        console.log('Esta acción NO se puede deshacer.\n');

        // En un entorno real, aquí añadirías confirmación del usuario
        const readline = require('node:readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise((resolve) => {
            rl.question('¿Estás seguro? Escribe "SI_ESTOY_SEGURO" para confirmar: ', resolve);
        });

        rl.close();

        if (answer !== 'SI_ESTOY_SEGURO') {
            console.log('🛡️  Operación cancelada. Base de datos conservada.');
            return;
        }

        // Eliminar base de datos
        if (fs.existsSync(this.dbPath)) {
            fs.unlinkSync(this.dbPath);
            console.log('🗑️  Base de datos eliminada');
        }

        // Eliminar archivos WAL y SHM si existen
        ['-wal', '-shm'].forEach(suffix => {
            const file = this.dbPath + suffix;
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                console.log(`🗑️  Archivo ${file} eliminado`);
            }
        });

        // Recrear base de datos con migraciones
        console.log('🔄 Recreando base de datos...');
        await this.runMigrations();
        
        console.log('✅ Base de datos recreada exitosamente');
    }

    // Mostrar ayuda
    showHelp() {
        console.log(`
🗄️  CLI de Base de Datos - Proyecto Motos

Comandos disponibles:

  migrate                    Ejecutar todas las migraciones pendientes
  create-migration <nombre>  Crear una nueva migración
  stats                      Mostrar estadísticas de la base de datos  
  reset                      Resetear completamente la base de datos
  help                       Mostrar esta ayuda

Ejemplos:
  node cli-db.js migrate
  node cli-db.js create-migration add_user_avatar
  node cli-db.js stats
  node cli-db.js reset

📚 Para más información, consulta la documentación del proyecto.
        `);
    }
}

// Ejecutar CLI si se llama directamente
if (require.main === module) {
    const cli = new DatabaseCLI();
    const args = process.argv.slice(2);
    cli.run(args).catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = DatabaseCLI;