const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const database = require('./src/database/connection');
const { ResponseUtils } = require('./utils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* 1) Confiar en proxy (antes de rate limiters) */
app.set('trust proxy', 1);

/* Seguridad y CORS */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }}));
app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    const allowed = [
      'http://localhost:3000','http://localhost:8080','http://127.0.0.1:3000',
      'capacitor://localhost','ionic://localhost','http://localhost'
    ];
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('No permitido por CORS'));
  }
}));

/* 2) Rate limiters (después de trust proxy) */
const apiLimiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15*60*1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success:false, message:'Demasiadas solicitudes, intenta de nuevo más tarde', timestamp:new Date().toISOString() },
  standardHeaders:true,
  legacyHeaders:false,
});
const authLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 5,
  message: { success:false, message:'Demasiados intentos de login, intenta de nuevo en 15 minutos', timestamp:new Date().toISOString() },
  standardHeaders:true,
  legacyHeaders:false,
});
app.use('/api/', apiLimiter);

/* Parsers y estáticos */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Rutas “públicas” HTML */
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'public','login.html')));
app.get('/register', (req,res)=> res.sendFile(path.join(__dirname,'public','register.html')));

/* 3) Arrancar, conectar BD y montar TODAS las rutas ANTES del 404 */
(async () => {
  try {
    await database.connect();

    // Rutas que ya tenías
    const motorcycleRoutes = require('./src/routes/motorcycleRoutes');
    const { router: authRoutes, authenticateToken } = require('./src/routes/authRoutes');

    // Importante: dashboard protegido puede quedarse aquí
    app.get('/dashboard', authenticateToken, (req,res)=> {
      res.sendFile(path.join(__dirname,'public','dashboard.html'));
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/motorcycles', motorcycleRoutes);

    // NUEVO: montar checklist DESPUÉS de conectar y ANTES del 404
    // OJO con el nombre del archivo: usa exactamente el mismo (mayúsculas/minúsculas)
    const checklistRouter = require('./src/routes/checkListRoutes')(database);
    app.use('/api/checklist', checklistRouter);

    const reportRoutes = require('./src/routes/reportRoute')(database);
    app.use('/api/report', reportRoutes);

    /* 4) 404 y manejadores de error SIEMPRE al final */
    app.use((req, res) => {
      const errResp = ResponseUtils.notFound('Endpoint no encontrado');
      res.status(errResp.status).json(errResp.response);
    });

    app.use((error, req, res, next) => {
      if (error.message === 'No permitido por CORS') {
        const errResp = ResponseUtils.error('CORS: Origen no permitido', 403);
        return res.status(errResp.status).json(errResp.response);
      }
      next(error);
    });

    app.use((error, req, res, next) => {
      console.error('Error no manejado:', error);
      if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        const errResp = ResponseUtils.validationError({ json: 'Formato JSON inválido' });
        return res.status(errResp.status).json(errResp.response);
      }
      const errResp = ResponseUtils.error('Error interno del servidor');
      res.status(errResp.status).json(errResp.response);
    });

    app.listen(PORT, () => console.log(`Servidor corriendo`));
  } catch (err) {
    console.error('Error iniciando el servidor:', err);
    process.exit(1);
  }
})();

/* Cierre graceful */
process.on('SIGTERM', () => { database.close(); process.exit(0); });
process.on('SIGINT',  () => { database.close(); process.exit(0); });