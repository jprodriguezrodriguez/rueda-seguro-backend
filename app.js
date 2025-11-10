const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const database = require('./src/database/connection');
const { ResponseUtils } = require('./utils');

// Importar rutas de demostración
const motorcycleRoutes = require('./src/routes/motorcycleRoutes');
const { router: authRoutes, authenticateToken } = require('./src/routes/authRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting para API
const apiLimiter = rateLimit({
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});

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

// Middleware de seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado para móviles
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // Permitir requests sin origin (apps móviles)
        if (!origin) return callback(null, true);

        // Lista de orígenes permitidos para desarrollo y producción
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'capacitor://localhost',
            'ionic://localhost',
            'http://localhost',
            // Agrega aquí los dominios de producción
        ];

        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}));

// Aplicar rate limiting a todas las rutas API
app.use('/api/', apiLimiter);

// Middleware para parsear el body y cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas públicas

// Página principal de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Dashboard (requiere autenticación)
app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// === RUTAS DE API ORGANIZADAS ===
// Usar las rutas de autenticación organizadas
app.use('/api/auth', authRoutes);

// Rutas de motos para demostración
app.use('/api/motorcycles', motorcycleRoutes);

// API: Health check endpoint
app.get('/api/health', (req, res) => {
    const successResponse = ResponseUtils.success({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    }, 'Servidor funcionando correctamente');
    res.status(successResponse.status).json(successResponse.response);
});

// Manejo de errores 404
app.use((req, res) => {
    const errorResponse = ResponseUtils.notFound('Endpoint no encontrado');
    res.status(errorResponse.status).json(errorResponse.response);
});

// Manejo de errores de CORS
app.use((error, req, res, next) => {
    if (error.message === 'No permitido por CORS') {
        const errorResponse = ResponseUtils.error('CORS: Origen no permitido', 403);
        return res.status(errorResponse.status).json(errorResponse.response);
    }
    next(error);
});

// Manejo de errores globales
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);

    // Error de validación de JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        const errorResponse = ResponseUtils.validationError({
            json: 'Formato JSON inválido'
        });
        return res.status(errorResponse.status).json(errorResponse.response);
    }

    const errorResponse = ResponseUtils.error('Error interno del servidor');
    res.status(errorResponse.status).json(errorResponse.response);
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
    console.log('Cerrando servidor...');
    database.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Cerrando servidor...');
    database.close();
    process.exit(0);
});

(async () => { // Inicializar servidor con top-level await
    try {
        // Conectar a la base de datos
        await database.connect();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Servidor corriendo`);
        });
    } catch (error) {
        console.error('Error iniciando el servidor:', error);
        process.exit(1);
    }
})();