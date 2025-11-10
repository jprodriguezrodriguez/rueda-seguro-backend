# 🗄️ Sistema de Base de Datos y Migraciones

## ¿Qué son las migraciones?

Las **migraciones** son como un "control de versiones" para tu base de datos. Te permiten:

- ✅ **Versionar cambios** en la estructura de la base de datos
- ✅ **Aplicar cambios** de forma ordenada y controlada  
- ✅ **Revertir cambios** si algo sale mal (rollback support)
- ✅ **Sincronizar** equipos de desarrollo
- ✅ **Deployar** cambios a producción de forma segura

## 🏗️ Arquitectura del Sistema

El sistema implementa un **MigrationManager** profesional que:

- � **Ejecuta migraciones automáticamente** al iniciar el servidor
- 📊 **Rastrea estado** de cada migración en tabla `schema_migrations`
- ⚡ **Optimiza rendimiento** con modo WAL de SQLite
- 🛡️ **Valida integridad** antes de ejecutar cambios
- 📝 **Registra logs detallados** de todas las operaciones

## �📁 Estructura del Sistema

```
src/database/
├── migrations/                    # Archivos de migración versionados
│   ├── 001_create_users_table.js
│   ├── 002_create_refresh_tokens_table.js
│   ├── 003_add_indexes.js
│   └── 004_add_motorcycles_table.js
├── models/                        # Modelos con métodos completos
│   ├── index.js                   # Exportación centralizada
│   ├── User.js                    # Modelo de usuario con validaciones
│   ├── RefreshToken.js            # Gestión de tokens de refresco
│   └── Motorcycle.js             # Modelo de ejemplo para motos
├── MigrationManager.js            # Sistema profesional de migraciones
└── connection.js                  # Conexión con inicialización automática
```

## 🚀 Comandos Útiles

### Gestión de Migraciones

```bash
# Ver estado actual de migraciones
npm run migrate status

# Aplicar migraciones pendientes
npm run migrate up

# Rollback última migración
npm run migrate down

# Ver estadísticas detalladas de la BD
npm run db-stats

# Ejecutar tests de la API
node test_api.js
```

### Comandos de Desarrollo

```bash
# Iniciar servidor (ejecuta migraciones automáticamente)
npm start

# Modo desarrollo con reinicio automático
npm run dev
## ⚡ Ejecución Automática

El sistema de migraciones se ejecuta **automáticamente** al iniciar el servidor:

```bash
npm start
# Output:
# 🔄 Iniciando sistema de migraciones...
# ✅ Migración 001_create_users_table.js aplicada
# ✅ Migración 002_create_refresh_tokens_table.js aplicada
# ✅ Migración 003_add_indexes.js aplicada
# ✅ Migración 004_add_motorcycles_table.js aplicada
# 🎯 4 migraciones ejecutadas correctamente
# 🚀 Servidor corriendo en http://localhost:3000
```

## � Migraciones Actuales

El proyecto incluye las siguientes migraciones:

### 001_create_users_table.js
- Crea tabla `users` con campos básicos
- Incluye índices en `username` y `email`
- Timestamps automáticos

### 002_create_refresh_tokens_table.js  
- Crea tabla `refresh_tokens` para gestión de tokens
- Relación con tabla `users`
- Campos de expiración y estado

### 003_add_indexes.js
- Optimiza consultas con índices adicionales
- Mejora rendimiento de autenticación
- Índices compuestos para consultas complejas

### 004_add_motorcycles_table.js (Ejemplo)
- Tabla de ejemplo para gestión de motos
- Demostración de relaciones y validaciones
- Campos de precio, marca, modelo, etc.

## 📝 Crear una Nueva Migración

### 1. Crear archivo manualmente:
```javascript
// src/database/migrations/005_add_user_profile.js
async function up(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            ALTER TABLE users 
            ADD COLUMN phone TEXT,
            ADD COLUMN avatar TEXT,
            ADD COLUMN bio TEXT
        `;

        db.exec(sql, (err) => {
            if (err) {
                console.error('❌ Error aplicando migración:', err);
                reject(err);
            } else {
                console.log('✅ Migración 005 aplicada exitosamente');
                resolve();
            }
        });
    });
}

async function down(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            ALTER TABLE users 
            DROP COLUMN phone,
            DROP COLUMN avatar,
            DROP COLUMN bio
        `;

        db.exec(sql, (err) => {
            if (err) {
                console.error('❌ Error revirtiendo migración:', err);
                reject(err);
            } else {
                console.log('✅ Migración 005 revertida exitosamente');
                resolve();
            }
        });
    });
}

module.exports = { up, down };
```

### 2. Aplicar nueva migración:
```bash
# Reiniciar servidor para aplicar automáticamente
npm start

# O aplicar manualmente
npm run migrate up
```

        db.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Campo phone agregado a users');
                resolve();
            }
        });
    });
}

async function down(db) {
    return new Promise((resolve, reject) => {
        // SQLite no soporta DROP COLUMN fácilmente
        // En este caso, recrearías la tabla sin el campo
        console.log('⚠️ Revertir esta migración requiere recrear la tabla');
        resolve();
    });
}

module.exports = { up, down };
```

### 3. Ejecutar migración:
```bash
npm run db:migrate
```

## 🔧 Uso de Modelos

### Arquitectura MVC

Los modelos están organizados siguiendo el patrón MVC:

```javascript
// src/database/connection.js
const database = require('./src/database/connection');
const { User, RefreshToken, Motorcycle } = database.getModels();

// Usar en controladores
const user = await User.findById(1);
const token = await RefreshToken.create(userId, tokenValue);
```

### Modelo User

```javascript
// Métodos disponibles en User model
const user = await User.create({
    username: 'nuevousuario',
    email: 'nuevo@test.com',
    password: 'hashedPassword'
});

const user = await User.findById(1);
const user = await User.findByUsername('usuario123');
const user = await User.findByEmail('usuario@test.com');
const isValid = await User.validatePassword(user.id, 'password123');
await User.updateLastLogin(user.id);
await User.updatePassword(user.id, 'newHashedPassword');
```

### Modelo RefreshToken

```javascript
// Gestión de tokens de refresco
const token = await RefreshToken.create(userId, tokenValue, expiresAt);
const token = await RefreshToken.findValidToken(tokenValue);
await RefreshToken.invalidateToken(tokenValue);
await RefreshToken.invalidateAllForUser(userId);
await RefreshToken.cleanupExpiredTokens();
```

### Modelo Motorcycle (Ejemplo)

```javascript
// Ejemplo de modelo para demostración
const moto = await Motorcycle.create({
    brand: 'Honda',
    model: 'CBR600RR',
    year: 2023,
    price: 12000
});

const motos = await Motorcycle.findAll();
const motos = await Motorcycle.findByBrand('Honda');
```

## 📂 Estructura de Archivos Actualizada

```
proyecto_motos_node/
├── app.js                          # Servidor principal con MVC
├── package.json                    # Dependencias y scripts
├── .env                           # Variables de entorno
├── 
├── public/                        # Frontend con CSP estricta
│   ├── img/
│   │   └── loading.gif           # GIF de loading
│   ├── js/                       # JavaScript modular
│   │   ├── login.js
│   │   ├── register.js
│   │   └── dashboard.js
│   ├── styles/
│   │   └── styles.css            # CSS con loading styles
│   ├── login.html                # Página de login
│   ├── register.html             # Página de registro
│   └── dashboard.html            # Dashboard principal
├── 
├── src/                          # Código fuente organizado
│   ├── controllers/              # Controladores MVC
│   │   ├── authController.js     # Lógica de autenticación
│   │   └── motorcycleController.js
│   ├── routes/                   # Rutas modulares
│   │   ├── authRoutes.js         # /api/auth/*
│   │   └── motorcycleRoutes.js   # /api/motorcycles/*
│   └── database/                 # Sistema de BD completo
│       ├── connection.js         # Conexión con auto-migración
│       ├── MigrationManager.js   # Gestor profesional
│       ├── models/               # Modelos con métodos
│       │   ├── index.js
│       │   ├── User.js
│       │   ├── RefreshToken.js
│       │   └── Motorcycle.js
│       └── migrations/           # Migraciones versionadas
│           ├── 001_create_users_table.js
│           ├── 002_create_refresh_tokens_table.js
│           ├── 003_add_indexes.js
│           └── 004_add_motorcycles_table.js
├── 
├── sqllite/                      # Base de datos
│   └── database.db              # SQLite con modo WAL
├── 
├── utils/                        # Utilidades centralizadas
│   ├── index.js                 # Exportaciones
│   ├── ResponseUtils.js         # Respuestas estandarizadas
│   ├── ValidationUtils.js       # Validaciones
│   └── TokenUtils.js            # Gestión de JWT
├── 
├── test_api.js                  # Tests de API
├── cli-db.js                    # CLI para base de datos
└── 📚 Documentación/
    ├── README.md                # Guía principal
    ├── API_DOCUMENTATION.md     # Documentación de API
    └── DATABASE_GUIDE.md        # Esta guía
```

## 🏗️ Ventajas del Sistema Actual

### ✅ **Arquitectura MVC Completa**
- **Separación clara** de responsabilidades
- **Controladores** con lógica de negocio
- **Modelos** con métodos completos
- **Rutas** organizadas y modulares

### ✅ **Sistema de Migraciones Automático**
- **Ejecución automática** al iniciar servidor
- **Versionado** de cambios de base de datos  
- **Rollback support** para reversar cambios
- **Logs detallados** de todas las operaciones

### ✅ **Seguridad Máxima**
- **Content Security Policy** estricta
- **Rate limiting** especializado
- **Middleware de autenticación** robusto
- **Validaciones** completas en todos los niveles

### ✅ **Experiencia de Usuario Superior**
- **Loading UX** con GIF animado
- **JavaScript modular** sin inline scripts  
- **Manejo de errores** elegante
- **Auto-redirección** inteligente
// Todo en un solo archivo database.js
// Cambios manuales en la BD
// Difícil sincronizar entre desarrolladores
// Riesgo de perder datos en cambios
```

### ✅ **Después (sistema de migraciones)**
```javascript
// Cambios versionados y controlados
// Historial completo de modificaciones  
// Fácil sincronización de equipos
// Rollback seguro de cambios
// Estructura organizada por responsabilidades
```

## 📊 Monitoreo y Mantenimiento

### Ver estadísticas:
```bash
npm run db:stats
```

### Salida esperada:
```
📊 Estadísticas de la base de datos

👥 Usuarios:
   Total: 15

🔑 Refresh Tokens:
   Total: 45
   Activos: 12
   Expirados: 28
   Invalidados: 5

💾 Base de datos:
   Archivo: ./database.db
   Tamaño: 248.32 KB
```

### Limpieza automática:
```javascript
// Limpiar tokens expirados automáticamente
setInterval(async () => {
    await Database.cleanExpiredRefreshTokens();
}, 24 * 60 * 60 * 1000); // Cada 24 horas
```

## 🔄 Migración desde el Sistema Actual

Si quieres migrar tu código actual al nuevo sistema:

### 1. **Mantener compatibilidad** (recomendado):
El nuevo sistema mantiene todos los métodos actuales:
- `Database.createUser()` ✅
- `Database.getUserByEmail()` ✅  
- `Database.createRefreshToken()` ✅
- etc.

### 2. **Solo cambiar la importación**:
```javascript
// Antes
const database = require('./database');

// Después  
const database = require('./src/database/connection');

// Todo lo demás funciona igual!
```

### 3. **Beneficios inmediatos**:
- ✅ Mejor rendimiento (WAL mode)
- ✅ Índices optimizados
- ✅ Estructura organizada
- ✅ Herramientas de monitoreo

## 🚨 Consejos Importantes

### ⚠️ **En Desarrollo**
- Siempre crea migraciones para cambios de BD
- Prueba migraciones antes de aplicar a producción
- Mantén backups antes de cambios importantes

### ⚠️ **En Producción**  
- NUNCA uses `npm run db:reset` 
- Siempre testa migraciones en staging primero
- Mantén backups regulares de la BD

### ⚠️ **Buenas Prácticas**
- Una migración = un cambio específico
- Nombres descriptivos: `add_user_avatar`, `create_orders_table`
- Siempre implementa función `down()` para rollback
- Documenta cambios complejos en la migración

## 🔗 Próximos Pasos

1. **Explora el nuevo sistema**:
   ```bash
   npm run db:stats
   npm run db:help
   ```

2. **Crea tu primera migración**:
   ```bash
   npm run db:create-migration add_user_avatar
   ```

3. **Usa los nuevos modelos** en lugar de consultas SQL directas

4. **Configura limpieza automática** de tokens en producción

¡El sistema está listo para crecer con tu proyecto! 🚀