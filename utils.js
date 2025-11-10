const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
require('dotenv').config();

class TokenUtils {
    // Generar Access Token (JWT)
    static generateAccessToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // Token de corta duración para mayor seguridad
        );
    }

    // Generar Refresh Token
    static generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }

    // Verificar Access Token
    static verifyAccessToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    // Calcular fecha de expiración para refresh token (7 días)
    static getRefreshTokenExpiration() {
        const now = new Date();
        const expiration = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 días
        return expiration.toISOString();
    }
}

class ValidationUtils {
    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar contraseña fuerte
    static isStrongPassword(password) {
        // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Validar username
    static isValidUsername(username) {
        // Solo letras, números y guiones bajos, entre 3 y 20 caracteres
        const usernameRegex = /^\w{3,20}$/;
        return usernameRegex.test(username);
    }

    // Sanitizar entrada de usuario
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replaceAll(/[<>]/g, '');
    }
}

class ResponseUtils {
    // Respuesta de éxito estándar
    static success(data = null, message = 'Operación exitosa', status = 200) {
        const response = {
            success: true,
            message,
            timestamp: new Date().toISOString()
        };

        if (data !== null) {
            response.data = data;
        }

        return { status, response };
    }

    // Respuesta de error estándar
    static error(message = 'Error interno del servidor', status = 500, errors = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (errors) {
            response.errors = errors;
        }

        return { status, response };
    }

    // Respuesta de validación fallida
    static validationError(errors, message = 'Errores de validación') {
        return this.error(message, 400, errors);
    }

    // Respuesta de autenticación fallida
    static authError(message = 'No autorizado') {
        return this.error(message, 401);
    }

    // Respuesta de recurso no encontrado
    static notFound(message = 'Recurso no encontrado') {
        return this.error(message, 404);
    }
}

module.exports = {
    TokenUtils,
    ValidationUtils,
    ResponseUtils
};