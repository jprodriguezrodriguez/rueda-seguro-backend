/**
 * Índice de modelos de base de datos
 * Exporta todos los modelos inicializados con la conexión de BD
 */

const User = require('./User');
const RefreshToken = require('./RefreshToken');
const ChecklistModel = require('./ChecklistModel');
const ReportModel = require('./ReportModel')

function createModels(db) {
    return {
        User: new User(db),
        RefreshToken: new RefreshToken(db),
        ChecklistModel: new ChecklistModel(db),
        ReportModel: new ReportModel(db),
    };
}

module.exports = createModels;