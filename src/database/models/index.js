/**
 * Índice de modelos de base de datos
 * Exporta todos los modelos inicializados con la conexión de BD
 */

const User = require('./User');
const RefreshToken = require('./RefreshToken');

function createModels(db) {
    return {
        User: new User(db),
        RefreshToken: new RefreshToken(db)
    };
}

module.exports = createModels;