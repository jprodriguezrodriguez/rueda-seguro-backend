const express = require('express');
const multer = require('multer');
const fs = require('node:fs'); // ✅ IMPORTANTE
const path = require('node:path');
const ReportModel = require('../database/models/ReportModel');

// ✅ Ruta absoluta hacia /src/uploads
const uploadDir = path.join(__dirname, '..', 'uploads');

// ✅ Crear carpeta si no existe (evita ENOENT)
fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Genera nombre único basado en timestamp + uuid opcional
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = function (database) {
  const router = express.Router();
  const model = new ReportModel(database);

  // ✅ Inicializar tipos si no existen
  model.initialize().catch(e => console.error('Error inicializando ReportModel:', e));

  // =====================
  // GET /api/report/types
  // =====================
  router.get('/types', async (req, res) => {
    try {
      const types = await model.getTypes();
      res.json(types);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'No se pudieron obtener los tipos de accidente' });
    }
  });

  // ===============
  // POST /api/report
  // ===============
  router.post('/', upload.single('photo'), async (req, res) => {
    try {
      const { userId, typeId, isSevere, message, latitude, longitude } = req.body;
      const photoPath = req.file ? req.file.filename : null;

      if (!userId || !typeId) {
        return res.status(400).json({ error: 'userId y typeId son obligatorios' });
      }

      const report = await model.create({
        userId: Number(userId),
        typeId: Number(typeId),
        isSevere: Number(isSevere) === 1,
        message: message || null,
        photoPath,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });

      // Aquí puedes enviar notificación a admin (socket, correo, etc.)
      res.status(201).json({ success: true, report });

    } catch (err) {
      console.error('❌ Error creando reporte:', err);
      res.status(500).json({ error: 'No se pudo crear el reporte' });
    }
  });

  // ===============
  // Get /api/report
  // ===============
  router.get('/report', async (req, res) => {
    try {
      const reports = await model.getAll();

      res.status(200).json({ success: true, reports });

    } catch (err) {
      console.error('❌ Error obteniendo reportes:', err);
      res.status(500).json({ error: 'No se pudieron obtener los reportes' });
    }
  });

  return router;
};