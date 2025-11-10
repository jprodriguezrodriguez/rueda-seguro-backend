// routes/motorcycleRoutes.js
// Rutas para el manejo de motos

const express = require('express');
const MotorcycleController = require('../controllers/motorcycleController');

const router = express.Router();
const motorcycleController = new MotorcycleController();

// Middleware para verificar autenticación (reutilizamos el del app.js)
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.authToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verificando token:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
}

// === RUTAS PÚBLICAS (sin autenticación) ===

// GET /api/motorcycles - Listar todas las motos (público para catálogo)
router.get('/', (req, res) => {
    motorcycleController.getAllMotorcycles(req, res);
});

// GET /api/motorcycles/stats - Estadísticas públicas
router.get('/stats', (req, res) => {
    motorcycleController.getMotorcycleStats(req, res);
});

// GET /api/motorcycles/:id - Ver detalle de una moto (público)
router.get('/:id', (req, res) => {
    motorcycleController.getMotorcycleById(req, res);
});

// === RUTAS PROTEGIDAS (requieren autenticación) ===

// POST /api/motorcycles - Crear nueva moto (solo usuarios autenticados)
router.post('/', verifyToken, (req, res) => {
    motorcycleController.createMotorcycle(req, res);
});

// PUT /api/motorcycles/:id - Actualizar moto existente
router.put('/:id', verifyToken, (req, res) => {
    motorcycleController.updateMotorcycle(req, res);
});

// DELETE /api/motorcycles/:id - Eliminar moto
router.delete('/:id', verifyToken, (req, res) => {
    motorcycleController.deleteMotorcycle(req, res);
});

// POST /api/motorcycles/:id/purchase - Comprar moto
router.post('/:id/purchase', verifyToken, (req, res) => {
    motorcycleController.purchaseMotorcycle(req, res);
});

module.exports = router;