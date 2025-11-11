// src/controllers/checklistController.js
class ChecklistController {
  constructor(model) {
    this.model = model;
  }

  getRandom = async (req, res) => {
    try {
      const rows = await this.model.getRandomQuestions(4);
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error obteniendo preguntas' });
    }
  }

  submit = async (req, res) => {
    try {
      const { userId, questionsList } = req.body;
      if (!userId || !Array.isArray(questionsList)) {
        return res.status(400).json({ error: 'userId y questionsList son obligatorios' });
      }
      const timestamp = await this.model.saveResponses(userId, questionsList);
      res.status(201).json({ success: true, timestamp });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error guardando respuestas' });
    }
  }

  pending = async (req, res) => {
    try {
      const { userId } = req.params;
      const rows = await this.model.getPendingByUser(userId);
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error obteniendo pendientes' });
    }
  }
}

module.exports = ChecklistController;