// routes/authRoutes.js
// Rutas para autenticación

const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');

const router = express.Router();
const authController = new AuthController();

// Rate limiting específico para login (más restrictivo)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP
    message: {
        success: false,
        message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
    try {
        // Obtener token del header Authorization o cookies
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1] || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido',
                timestamp: new Date().toISOString()
            });
        }

        // Verificar token
        const { TokenUtils } = require('../../utils');
        const decoded = await TokenUtils.verifyAccessToken(token);
        
        // Obtener usuario de la base de datos
        const database = require('../database/connection');
        const { User } = database.getModels();
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado',
                timestamp: new Date().toISOString()
            });
        }

        // Agregar información del usuario al request
        req.user = decoded;
        req.user.userData = user;
        next();

    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            timestamp: new Date().toISOString()
        });
    }
};

// === RUTAS PÚBLICAS ===

// POST /api/auth/register - Registro de usuario
router.post('/register', authLimiter, (req, res) => {
    authController.register(req, res);
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', authLimiter, (req, res) => {
    authController.login(req, res);
});

// POST /api/auth/refresh-token - Renovar access token
router.post('/refresh-token', (req, res) => {
    authController.refreshToken(req, res);
});

// === RUTAS PROTEGIDAS (requieren autenticación) ===

// POST /api/auth/logout - Cerrar sesión (no requiere token válido)
router.post('/logout', (req, res) => {
    authController.logout(req, res);
});

// POST /api/auth/logout-all - Cerrar todas las sesiones
router.post('/logout-all', authenticateToken, (req, res) => {
    authController.logoutAll(req, res);
});

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, (req, res) => {
    authController.changePassword(req, res);
});

// GET /api/auth/user - Obtener información del usuario
router.get('/user', authenticateToken, (req, res) => {
    authController.getUser(req, res);
});

router.get('/health', (_, res) => res.json({ ok: true }));

// GET /api/auth/status - Verificar estado de autenticación
router.get('/status', authenticateToken, (req, res) => {
    authController.checkAuthStatus(req, res);
});

module.exports = { router, authenticateToken };