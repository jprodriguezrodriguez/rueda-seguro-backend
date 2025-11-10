// controllers/authController.js
// Controlador para manejo de autenticación

const bcrypt = require('bcrypt');
const database = require('../database/connection');
const { TokenUtils, ValidationUtils, ResponseUtils } = require('../../utils');

class AuthController {
    // Registro de usuario
    async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Validación de campos requeridos
            if (!username || !email || !password || !confirmPassword) {
                const errorResponse = ResponseUtils.validationError({
                    message: 'Todos los campos son obligatorios'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Validar formato de email
            if (!ValidationUtils.isValidEmail(email)) {
                const errorResponse = ResponseUtils.validationError({
                    email: 'Formato de email inválido'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Validar username
            if (!ValidationUtils.isValidUsername(username)) {
                const errorResponse = ResponseUtils.validationError({
                    username: 'El username debe tener entre 3-20 caracteres y solo contener letras, números y guiones bajos'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Validar contraseñas
            if (password !== confirmPassword) {
                const errorResponse = ResponseUtils.validationError({
                    password: 'Las contraseñas no coinciden'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            if (!ValidationUtils.isStrongPassword(password)) {
                const errorResponse = ResponseUtils.validationError({
                    password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Verificar si el usuario ya existe
            const { User, RefreshToken } = database.getModels();
            const existingUserByEmail = await User.findByEmail(email.toLowerCase());
            if (existingUserByEmail) {
                const errorResponse = ResponseUtils.validationError({
                    email: 'El email ya está registrado'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            const existingUserByUsername = await User.findByUsername(username.toLowerCase());
            if (existingUserByUsername) {
                const errorResponse = ResponseUtils.validationError({
                    username: 'El nombre de usuario ya está en uso'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Crear nuevo usuario
            const hashedPassword = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12);
            
            const newUser = await User.create(
                username.toLowerCase(),
                email.toLowerCase(),
                hashedPassword
            );

            // Generar tokens
            const accessToken = TokenUtils.generateAccessToken({ userId: newUser.id, username: newUser.username });
            const refreshToken = TokenUtils.generateRefreshToken();
            const refreshTokenExpiration = TokenUtils.getRefreshTokenExpiration();

            // Guardar refresh token en la base de datos
            await RefreshToken.create(newUser.id, refreshToken, refreshTokenExpiration);

            // Configurar cookies
            this.setAuthCookies(res, accessToken, refreshToken);

            // Respuesta exitosa (sin incluir password)
            const userWithoutPassword = { ...newUser };
            delete userWithoutPassword.password;
            const successResponse = ResponseUtils.success(
                {
                    user: userWithoutPassword,
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                },
                'Usuario registrado exitosamente'
            );

            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error en registro:', error);
            const errorResponse = ResponseUtils.error('Error interno del servidor durante el registro');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Login de usuario
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validar campos requeridos
            if (!username || !password) {
                const errorResponse = ResponseUtils.validationError({
                    message: 'Username y contraseña son obligatorios'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Buscar usuario por username o email
            const { User, RefreshToken } = database.getModels();
            let user = await User.findByUsername(username.toLowerCase());
            if (!user) {
                user = await User.findByEmail(username.toLowerCase());
            }

            if (!user) {
                const errorResponse = ResponseUtils.authError('Credenciales inválidas');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Verificar contraseña
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                const errorResponse = ResponseUtils.authError('Credenciales inválidas');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Actualizar último login
            await User.updateLastLogin(user.id);

            // Generar tokens
            const accessToken = TokenUtils.generateAccessToken({ userId: user.id, username: user.username });
            const refreshToken = TokenUtils.generateRefreshToken();
            const refreshTokenExpiration = TokenUtils.getRefreshTokenExpiration();

            // Guardar refresh token en la base de datos
            await RefreshToken.create(user.id, refreshToken, refreshTokenExpiration);

            // Configurar cookies
            this.setAuthCookies(res, accessToken, refreshToken);

            // Respuesta exitosa (sin incluir password)
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            const successResponse = ResponseUtils.success(
                {
                    user: userWithoutPassword,
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                },
                'Inicio de sesión exitoso'
            );

            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error en login:', error);
            const errorResponse = ResponseUtils.error('Error interno del servidor durante el login');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Logout del usuario
    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            
            if (refreshToken) {
                const { RefreshToken } = database.getModels();
                await RefreshToken.invalidate(refreshToken);
            }

            // Limpiar cookies
            this.clearAuthCookies(res);

            const successResponse = ResponseUtils.success(null, 'Sesión cerrada exitosamente');
            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error en logout:', error);
            // Aún así limpiamos las cookies
            this.clearAuthCookies(res);
            const successResponse = ResponseUtils.success(null, 'Sesión cerrada');
            res.status(successResponse.status).json(successResponse.response);
        }
    }

    // Logout en todos los dispositivos
    async logoutAll(req, res) {
        try {
            const userId = req.user.userData.id;
            const { RefreshToken } = database.getModels();
            await RefreshToken.invalidateAllForUser(userId);

            // Limpiar cookies
            this.clearAuthCookies(res);

            const successResponse = ResponseUtils.success(null, 'Sesiones cerradas en todos los dispositivos');
            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error en logout-all:', error);
            this.clearAuthCookies(res);
            const errorResponse = ResponseUtils.error('Error cerrando sesiones');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Renovar token de acceso
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                const errorResponse = ResponseUtils.unauthorizedError('Refresh token requerido');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Verificar refresh token
            const decoded = await TokenUtils.verifyRefreshToken(refreshToken);
            
            // Verificar que el token existe en la base de datos
            const { RefreshToken } = database.getModels();
            const tokenRecord = await RefreshToken.findValidToken(refreshToken);
            if (!tokenRecord) {
                const errorResponse = ResponseUtils.unauthorizedError('Refresh token inválido');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Generar nuevo access token
            const newAccessToken = await TokenUtils.generateAccessToken(decoded.userId);
            
            // Configurar cookie del nuevo access token
            res.cookie('token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000, // 15 minutos
                sameSite: 'strict'
            });

            const successResponse = ResponseUtils.success(
                {
                    accessToken: newAccessToken
                },
                'Token renovado exitosamente'
            );

            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error renovando token:', error);
            this.clearAuthCookies(res);
            const errorResponse = ResponseUtils.unauthorizedError('Error renovando token');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Cambiar contraseña
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            const userId = req.user.userData.id;

            // Validar campos requeridos
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                const errorResponse = ResponseUtils.validationError({
                    message: 'Todos los campos son obligatorios'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Validar que las nuevas contraseñas coincidan
            if (newPassword !== confirmNewPassword) {
                const errorResponse = ResponseUtils.validationError({
                    password: 'Las nuevas contraseñas no coinciden'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Validar fortaleza de la nueva contraseña
            if (!ValidationUtils.isStrongPassword(newPassword)) {
                const errorResponse = ResponseUtils.validationError({
                    password: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
                });
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Obtener usuario actual
            const { User } = database.getModels();
            const user = await User.findByIdWithPassword(userId);
            if (!user) {
                const errorResponse = ResponseUtils.notFound('Usuario no encontrado');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Verificar contraseña actual
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                const errorResponse = ResponseUtils.unauthorizedError('Contraseña actual incorrecta');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Hash de la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12);

            // Actualizar contraseña en la base de datos
            await User.updatePassword(userId, hashedNewPassword);

            // Cerrar todas las sesiones activas por seguridad
            const { RefreshToken } = database.getModels();
            await RefreshToken.invalidateAllForUser(userId);

            // Limpiar cookies
            this.clearAuthCookies(res);

            const successResponse = ResponseUtils.success(null, 'Contraseña cambiada exitosamente');
            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            const errorResponse = ResponseUtils.error('Error interno del servidor');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Obtener información del usuario autenticado
    async getUser(req, res) {
        try {
            // Usar el usuario que ya obtuvimos en el middleware
            const user = req.user.userData;

            if (!user) {
                const errorResponse = ResponseUtils.notFound('Usuario no encontrado');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            // Remover password de la respuesta (por si acaso)
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            
            const successResponse = ResponseUtils.success(
                { user: userWithoutPassword },
                'Información del usuario obtenida exitosamente'
            );

            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            const errorResponse = ResponseUtils.error('Error obteniendo información del usuario');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Verificar estado de autenticación
    async checkAuthStatus(req, res) {
        try {
            const userId = req.user.userData.id;
            const { User } = database.getModels();
            const user = await User.findById(userId);

            if (!user) {
                const errorResponse = ResponseUtils.unauthorizedError('Usuario no encontrado');
                return res.status(errorResponse.status).json(errorResponse.response);
            }

            const authStatus = {
                authenticated: true,
                user_id: userId,
                username: user.username,
                email: user.email,
                last_login: user.last_login,
                token_issued_at: req.user.iat,
                token_expires_at: req.user.exp
            };

            const successResponse = ResponseUtils.success(authStatus, 'Usuario autenticado');
            res.status(successResponse.status).json(successResponse.response);

        } catch (error) {
            console.error('Error verificando estado de autenticación:', error);
            const errorResponse = ResponseUtils.error('Error verificando autenticación');
            res.status(errorResponse.status).json(errorResponse.response);
        }
    }

    // Métodos auxiliares para manejo de cookies
    setAuthCookies(res, accessToken, refreshToken) {
        // Cookie para access token
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15 minutos
            sameSite: 'strict'
        });

        // Cookie para refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            sameSite: 'strict'
        });
    }

    clearAuthCookies(res) {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
    }
}

module.exports = AuthController;