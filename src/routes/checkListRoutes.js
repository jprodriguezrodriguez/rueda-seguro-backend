// src/routes/checkListRoutes.js
const express = require('express');
const ChecklistModel = require('../database/models/ChecklistModel');
const ChecklistController = require('../controllers/checklistController');

module.exports = function makeChecklistRouter(database) {
  const router = express.Router();

  // OJO: pasamos "database" (wrapper) y NO database.db
  const model = new ChecklistModel(database);
  // inicialización sin bloquear el montaje
  model.initialize().catch(err => console.error('Error inicializando checklist:', err));

  const controller = new ChecklistController(model);

  router.get('/', controller.getRandom);
  router.post('/', controller.submit);
  router.get('/pending/:userId', controller.pending);

  return router;
};