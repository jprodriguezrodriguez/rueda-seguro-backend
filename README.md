# Proyecto Motos Node.js - API de Autenticación y Gestión

## Descripción General

Este proyecto es un ejemplo completo de una API de autenticación construida con **arquitectura MVC** usando Node.js, Express y SQLite. Incluye un sistema completo de autenticación web, sistema de migración de base de datos automático y una interfaz frontend moderna con Content Security Policy estricta.

## Características Principales

### Sistema de Autenticación Completo
- **Registro de usuarios** con validación robusta y hash de contraseñas
- **Login seguro** con JWT (Access + Refresh tokens, 15min/7días)
- **Middleware de autenticación** robusto para rutas protegidas
- **Logout** individual y en todos los dispositivos con limpieza de cookies
- **Cambio de contraseñas** con validación y cierre de sesiones por seguridad
- **Rate limiting** especializado (5 intentos/15min para auth, 100/15min general)
- **Validaciones de seguridad** completas (CORS móvil, Helmet, CSP estricta)

### Arquitectura MVC Profesional
- **Controladores** organizados (`src/controllers/`)
- **Modelos** con métodos completos (`src/database/models/`)
- **Rutas** modulares y organizadas (`src/routes/`)
- **Middleware** de autenticación reutilizable
- **Utilidades** centralizadas (`utils/`)
- **Separación de responsabilidades** clara

### Sistema de Base de Datos Avanzado
- **SQLite** con modo WAL para máximo rendimiento
- **Sistema de migraciones automático** con versionado
- **MigrationManager** profesional con rollback support
- **Modelos organizados** (Users, RefreshTokens, Motorcycles)
- **CLI de migración** (`npm run migrate`)
- **Índices optimizados** para consultas rápidas

### Frontend Moderno y Seguro
- **Content Security Policy estricta** sin inline scripts
- **Loading UX** con GIF animado en todas las operaciones
- **Dashboard interactivo** con JavaScript modular
- **Manejo de estados** completo y errores elegantes
- **Diseño responsive** y accesible
- **Event listeners externos** para máxima seguridad
- **Auto-redirección** basada en estado de autenticación

### API de Ejemplo (Motos)
- **CRUD completo** para gestión de motos
- **Filtros avanzados** (marca, precio, disponibilidad)
- **Estadísticas** del inventario en tiempo real
- **Endpoints protegidos** con middleware de autenticación

## Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación
```bash
# Clonar o navegar al proyecto
cd proyecto_motos_node

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env
```

### Inicializar Base de Datos
```bash
# Ejecutar migraciones
# Configurar variables de entorno (opcional)
cp .env.example .env  # Si existe
# O crear .env con:
# PORT=3000
# JWT_SECRET=tu_jwt_secret_super_seguro
# JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
# BCRYPT_ROUNDS=12

# Ejecutar migraciones automáticas (se ejecutan al iniciar)
npm start
```

### Scripts Disponibles
```bash
# Iniciar servidor de desarrollo
npm start
npm run dev

# Gestión de migraciones de BD
npm run migrate status    # Ver estado de migraciones
npm run migrate up        # Aplicar migraciones pendientes  
npm run migrate down      # Rollback última migración

# Estadísticas de base de datos
npm run db-stats

# Testing de API
node test_api.js
```

### Ejecutar el Servidor
```bash
# Desarrollo
npm start

# El servidor iniciará automáticamente:
#   Base de datos conectada
#   Migraciones ejecutadas automáticamente  
#   Servidor corriendo en http://localhost:3000
```

## Interfaz Web

El proyecto incluye una interfaz web completa:

### Páginas Disponibles
- **http://localhost:3000/** - Página de login
- **http://localhost:3000/register** - Página de registro
- **http://localhost:3000/dashboard** - Dashboard (requiere autenticación)

##   Documentación de la API

###   Endpoints de Autenticación

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "usuario123",
    "email": "usuario@email.com",
    "password": "MiPassword123!",
    "confirmPassword": "MiPassword123!"
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Usuario registrado exitosamente",
    "data": {
        "user": {
            "id": 1,
            "username": "usuario123",
            "email": "usuario@email.com"
        },
        "tokens": {
            "accessToken": "jwt_token_here",
            "refreshToken": "refresh_token_here"
        }
    }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "usuario123",
    "password": "MiPassword123!"
}
```
*Nota: `username` puede ser nombre de usuario o email*

#### Logout
```http
POST /api/auth/logout
```
*Nota: Obtiene tokens automáticamente de cookies*

#### Actualizar Token
```http
POST /api/auth/refresh-token
```
*Nota: Obtiene refresh token automáticamente de cookies*

#### Información del Usuario
```http
GET /api/auth/user
Authorization: Bearer jwt_token_here
```

#### Verificar Estado de Autenticación
```http
GET /api/auth/status
Authorization: Bearer jwt_token_here
```

#### Cambiar Contraseña
```http
POST /api/auth/change-password
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
    "currentPassword": "MiPasswordActual123!",
    "newPassword": "MiNuevoPassword456@",
    "confirmNewPassword": "MiNuevoPassword456@"
}
```

#### Logout de Todos los Dispositivos
```http
POST /api/auth/logout-all
Authorization: Bearer jwt_token_here
```

###   Endpoints de Motos (Ejemplo)

#### Listar Todas las Motos
```http
GET /api/motorcycles
GET /api/motorcycles?available=true&marca=Honda&min_price=5000&max_price=15000
```

#### Obtener una Moto Específica
```http
GET /api/motorcycles/{id}
```

#### Crear Nueva Moto (Requiere Autenticación)
```http
POST /api/motorcycles
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
    "marca": "Honda",
    "modelo": "CBR600RR",
    "año": 2024,
    "color": "Rojo",
    "cilindrada": 600,
    "precio": 12500,
    "descripcion": "Deportiva de alto rendimiento"
}
```

#### Comprar Moto (Requiere Autenticación)
```http
POST /api/motorcycles/{id}/purchase
Authorization: Bearer jwt_token_here
```

#### Estadísticas del Inventario
```http
GET /api/motorcycles/stats
```

### Endpoints de Sistema

#### Health Check
```http
GET /api/health
```

##   Uso desde Aplicaciones Móviles

### Configuración CORS
El servidor está configurado para aceptar requests desde aplicaciones móviles:
- Capacitor: `capacitor://localhost`
- Ionic: `ionic://localhost`
- Requests sin origin (apps nativas)

### Autenticación en Móviles
```javascript
// Ejemplo de login desde app móvil
const login = async (username, password) => {
    try {
        const response = await fetch('http://tu-servidor:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (data.success) {
            // Guardar token en storage local
            localStorage.setItem('authToken', data.data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        }
        
        return data;
    } catch (error) {
        console.error('Error en login:', error);
    }
};

// Ejemplo de request autenticado
const getMotorcycles = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('http://tu-servidor:3000/api/motorcycles', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo motos:', error);
    }
};
```

## Estructura del Proyecto

```
proyecto_motos_node/
├── app.js                          # Servidor principal
├── database.js                     # Conexión a BD (legacy)
├── utils.js                        # Utilidades (JWT, validaciones)
├── package.json                    # Dependencias del proyecto
├── public/                         # Frontend
│   ├── login.html                  # Página de login
│   ├── register.html               # Página de registro
│   ├── dashboard.html              # Dashboard interactivo
│   └── styles.css                  # Estilos
├── src/                           # Código organizado
│   ├── database/                   # Nueva estructura de BD
│   │   ├── connection.js           # Gestión de conexiones
│   │   ├── migrations/             # Archivos de migración
│   │   └── models/                 # Modelos de datos
│   ├── controllers/                # Controladores de negocio
│   │   └── motorcycleController.js # Ejemplo de controlador
│   └── routes/                     # Rutas organizadas
│       └── motorcycleRoutes.js     # Ejemplo de rutas
└── README.md                       # Este archivo
```

## Características de Seguridad

### Implementadas
-   **Hashing de contraseñas** con bcrypt (12 rounds)
-   **JWT tokens** con expiración (15 min access, 7 días refresh)
-   **Rate limiting** (15 req/min login, 100 req/min API)
-   **Validación de inputs** robusta
-   **CORS configurado** para móviles
-   **Helmet** para headers de seguridad
-   **Sanitización** de datos
-   **Manejo de errores** seguro

### Recomendaciones Adicionales para Producción
-   Usar HTTPS obligatorio
-   Variables de entorno para secretos
-   Logging de seguridad
-   Backup automático de BD
-   Monitoreo de intrusions

## Testing del Dashboard

Una vez que el servidor esté corriendo, puedes probar todas las funcionalidades:

1. **Visita** `http://localhost:3000`
2. **Regístrate** con un nuevo usuario
3. **Inicia sesión** y accede al dashboard
4. **Prueba las funciones**:
   - Información personal
   - Gestión de motos (demo)
   - Estadísticas del sistema
   - Cambio de contraseña

## 🚀 Scripts NPM Útiles

```bash
# Ejecutar servidor
npm start

# Migrar base de datos
npm run migrate up

# Ver estado de migraciones
npm run migrate status

# Revertir migración
npm run migrate down

# Estadísticas de BD
npm run db-stats

# Limpiar base de datos
npm run db-reset
```

## Contribución

Este es un proyecto de ejemplo, pero si quieres mejorarlo:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

---

## Preguntas Frecuentes

### ¿Cómo cambio el puerto del servidor?
Modifica la variable `PORT` en el archivo `.env` o cambia la línea `const PORT = process.env.PORT || 3000;` en `app.js`.

### ¿Cómo agrego más endpoints?
1. Crea un nuevo controlador en `src/controllers/`
2. Define las rutas en `src/routes/`
3. Importa y usa las rutas en `app.js`

### ¿Cómo conecto con una base de datos real?
Modifica `database.js` o `src/database/connection.js` para usar PostgreSQL, MySQL u otra BD.

### ¿Es seguro para producción?
Necesita algunas configuraciones adicionales como HTTPS, variables de entorno seguras, y monitoreo, pero la base es sólida.

---

¡Gracias por usar este proyecto de ejemplo!
