class ReportModel {
    constructor(db) {
        this.db = db;
        // Definición de tipos por defecto
        this.defaultTypes = [
            {
                name: 'Accidente con heridos',
                description: 'Choque o caída con personas lesionadas que requieren ayuda inmediata.',
            },
            {
                name: 'Accidente sin heridos',
                description: 'Incidente vial con daños materiales, sin lesionados aparentes.',
            },
            {
                name: 'Peligro en vía (obstáculo/derrame)',
                description: 'Riesgo en la carretera (aceite, grava, objeto, hueco) que puede causar accidentes.',
            },
        ];
    }

    // Crea tablas y siembra tipos de accidente si no existen
    async initialize() {
        // Crea tablas (por si no se han creado con migración)
        await this.db.query(
            `CREATE TABLE IF NOT EXISTS accident_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );`
        );
        await this.db.query(
            `CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type_id INTEGER NOT NULL,
        is_severe INTEGER NOT NULL DEFAULT 0,
        message TEXT,
        photo_path TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY(type_id) REFERENCES accident_types(id)
      );`
        );
        // Verifica si hay tipos existentes
        const rows = await this.db.query('SELECT COUNT(*) AS c FROM accident_types');
        if (rows[0].c === 0) {
            for (const t of this.defaultTypes) {
                await this.db.query(
                    'INSERT INTO accident_types(name, description) VALUES(?, ?)',
                    [t.name, t.description]
                );
            }
        }
    }

    async getTypes() {
        return this.db.query('SELECT id, name, description FROM accident_types ORDER BY id');
    }

    async create({ userId, typeId, isSevere, message, photoPath, latitude, longitude }) {
        const result = await this.db.query(
            `INSERT INTO reports (
        user_id, type_id, is_severe, message, photo_path, latitude, longitude
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                typeId,
                isSevere ? 1 : 0,
                message,
                photoPath,
                latitude,
                longitude
            ]
        );

        // SQLite con `db.run` suele devolver lastID dentro del objeto result
        const id = result.lastID;
        return { id, userId, typeId, isSevere, message, photoPath, latitude, longitude };
    }

}

module.exports = ReportModel;