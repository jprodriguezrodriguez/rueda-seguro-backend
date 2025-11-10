# API de Autenticación - Proyecto Motos

## Descripción
API RESTful para autenticación de usuarios construida con Node.js, Express y SQLite. Implementa arquitectura MVC completa con controladores, modelos y sistema de migración de base de datos. Diseñada especialmente para aplicaciones móviles y web con soporte completo para tokens JWT y refresh tokens.

## Arquitectura del Proyecto
- **MVC Pattern**: Separación clara entre controladores, modelos y vistas
- **Sistema de Migración**: Gestión automática de versiones de base de datos
- **Content Security Policy**: Implementación estricta de CSP para máxima seguridad
- **Loading UX**: Sistema de loading con GIF animado para mejorar experiencia de usuario
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Middleware de Autenticación**: Sistema robusto de verificación de tokens

## Configuración de Seguridad
- Rate limiting implementado (100 req/15min general, 5 req/15min para login)
- Tokens de acceso con expiración corta (15 minutos)
- Refresh tokens con rotación automática (7 días)
- Contraseñas hasheadas con bcrypt (12 rounds)
- Validaciones de entrada robustas
- Headers de seguridad con Helmet
- CORS configurado para aplicaciones móviles
- Content Security Policy estricta sin inline scripts
- Middleware de autenticación con manejo de errores detallado

## Base URL
```
http://localhost:3000
```

## API Base URL
```
http://localhost:3000/api
```

## Autenticación
La API utiliza JWT (JSON Web Tokens) para autenticación. Existen dos tipos de tokens:

1. **Access Token**: De corta duración (15 min) para acceder a endpoints protegidos
2. **Refresh Token**: De larga duración (7 días) para renovar access tokens

### Envío de Tokens
Los tokens se pueden enviar de dos formas:

1. **Header Authorization** (recomendado para móviles):
```
Authorization: Bearer <access_token>
```

2. **Cookies** (para aplicaciones web):
Los tokens se configuran automáticamente como httpOnly cookies.

## Endpoints

### 🔓 Endpoints Públicos

#### Health Check
```http
GET /api/health
```
Verifica el estado del servidor y base de datos.

**Respuesta:**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente",
  "data": {
    "status": "healthy",
    "timestamp": "2024-11-09T20:30:00.000Z",
    "version": "1.0.0",
    "environment": "development"
  },
  "timestamp": "2024-11-09T20:30:00.000Z"
}
```

#### Registro de Usuario
```http
POST /api/auth/register
```

**Body:**
```json
{
  "username": "usuario123",
  "email": "usuario@email.com",
  "password": "MiPassword123!",
  "confirmPassword": "MiPassword123!"
}
```

**Validaciones:**
- Username: 3-20 caracteres, solo letras, números y guiones bajos
- Email: Formato válido
- Password: Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@email.com"
    }
  },
  "timestamp": "2024-11-09T20:30:00.000Z"
}
```

#### Login
```http
POST /api/auth/login
```

**Rate Limit:** 5 intentos por IP cada 15 minutos

**Body:**
```json
{
  "username": "usuario123",
  "password": "MiPassword123!"
}
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@email.com",
      "lastLogin": "2024-11-09T20:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
      "expiresIn": "15m"
    }
  },
  "timestamp": "2024-11-09T20:30:00.000Z"
}
```

#### Renovar Token
```http
POST /api/auth/refresh-token
```

**Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7...",
      "expiresIn": "15m"
    }
  },
  "timestamp": "2024-11-09T20:30:00.000Z"
}
```

#### Logout
```http
POST /api/auth/logout
```

**Body:** Ninguno requerido (obtiene token de cookies automáticamente)
```

### 🔒 Endpoints Protegidos

Requieren Access Token válido en el header Authorization.

#### Información del Usuario
```http
GET /api/auth/user
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Información del usuario obtenida exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@email.com",
      "created_at": "2024-11-09T20:00:00.000Z",
      "last_login": "2024-11-09T20:30:00.000Z"
    }
  },
  "timestamp": "2024-11-09T20:30:00.000Z"
}
```

#### Estado de Autenticación
```http
GET /api/auth/status
Authorization: Bearer <access_token>
```

#### Cambiar Contraseña
```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "currentPassword": "MiPasswordActual123!",
  "newPassword": "MiNuevoPassword456@",
  "confirmNewPassword": "MiNuevoPassword456@"
}
```

#### Logout de Todos los Dispositivos
```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

## Códigos de Respuesta

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación
- **401**: No autorizado (token faltante/inválido)
- **403**: Prohibido (permisos insuficientes)
- **404**: Recurso no encontrado
- **429**: Demasiadas solicitudes (rate limit)
- **500**: Error interno del servidor

## Rutas Web (Frontend)

El servidor también proporciona rutas web con interfaz completa:

### Páginas Públicas
```http
GET /                    # Página de login
GET /register           # Página de registro
```

### Páginas Protegidas
```http
GET /dashboard          # Dashboard principal (requiere autenticación)
```

### Características del Frontend
- **Loading UX**: GIF animado durante operaciones asíncronas
- **Content Security Policy**: Implementación estricta sin inline scripts
- **Responsive Design**: Compatible con dispositivos móviles y desktop
- **Error Handling**: Manejo robusto de errores con feedback visual
- **Auto-redirect**: Redirección automática basada en estado de autenticación

## Manejo de Errores

Todas las respuestas de error siguen el formato estándar:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": {
    "campo": "Descripción específica del error"
  },
  "timestamp": "2024-11-09T20:30:00.000Z"
}
```

## Rate Limiting

- **API General**: 100 requests por IP cada 15 minutos
- **Endpoints de Autenticación**: 5 requests por IP cada 15 minutos

## Arquitectura MVC

### Controladores (`src/controllers/`)
- `authController.js`: Lógica de autenticación completa
- `motorcycleController.js`: Ejemplo de controlador para motos

### Modelos (`src/database/models/`)
- `User.js`: Modelo de usuario con métodos completos
- `RefreshToken.js`: Gestión de refresh tokens
- `Motorcycle.js`: Modelo de ejemplo

### Sistema de Migración
- **Automático**: Se ejecuta al iniciar el servidor
- **Versionado**: Control de versión de esquema de base de datos
- **Rollback**: Soporte para rollback de migraciones

## Implementación en App Móvil

### Configuración Inicial
1. Guarda la base URL de la API: `http://localhost:3000/api`
2. Configura interceptores para manejar tokens automáticamente
3. Implementa renovación automática de tokens

### Ejemplo de Interceptor (JavaScript)
```javascript
// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar renovación de tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          const response = await refreshAccessToken(refreshToken);
          // Guardar nuevos tokens y reintentar request original
          return api.request(error.config);
        } catch (refreshError) {
          // Redirect a login
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Mejores Prácticas

1. **Almacenamiento Seguro**: Usa keychain/keystore para tokens
2. **Renovación Automática**: Implementa renovación automática antes de expiración
3. **Manejo de Errores**: Maneja graciosamente errores de red y autenticación
4. **Logout Automático**: Implementa logout automático en tokens inválidos
5. **Validación Local**: Valida datos antes de enviar a la API

## Variables de Entorno Requeridas

```bash
PORT=3000
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
NODE_ENV=development
DB_PATH=./database.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY_DAYS=7
```

## Instalación y Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia y modifica el archivo `.env` con tus configuraciones.

3. **Iniciar servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

La base de datos SQLite se creará automáticamente en la primera ejecución.