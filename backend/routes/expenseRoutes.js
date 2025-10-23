const express = require('express');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getMonthlyStats
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');
/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Créer une dépense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montant:
 *                 type: number
 *                 example: 2500
 *               categorie:
 *                 type: string
 *                 example: "alimentation"
 *               description:
 *                 type: string
 *                 example: "Déjeuner"
 *     responses:
 *       201:
 *         description: Dépense créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *   get:
 *     summary: Lister toutes les dépenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des dépenses
 *       401:
 *         description: Non autorisé
 */
/**
 * @swagger
 * /api/expenses/stats/summary:
 *   get:
 *     summary: Obtenir les statistiques globales des dépenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales récupérées
 *       401:
 *         description: Non autorisé
 */
/**
 * @swagger
 * /api/expenses/stats/monthly:
 *   get:
 *     summary: Obtenir les statistiques mensuelles des dépenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques mensuelles récupérées
 *       401:
 *         description: Non autorisé
 */
/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Obtenir une dépense par ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la dépense
 *     responses:
 *       200:
 *         description: Dépense trouvée
 *       404:
 *         description: Dépense non trouvée
 *       401:
 *         description: Non autorisé
 *   put:
 *     summary: Mettre à jour une dépense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la dépense
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montant:
 *                 type: number
 *                 example: 3000
 *               categorie:
 *                 type: string
 *                 example: "transport"
 *               description:
 *                 type: string
 *                 example: "Taxi"
 *     responses:
 *       200:
 *         description: Dépense mise à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Dépense non trouvée
 *       401:
 *         description: Non autorisé
 *   delete:
 *     summary: Supprimer une dépense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la dépense
 *     responses:
 *       200:
 *         description: Dépense supprimée
 *       404:
 *         description: Dépense non trouvée
 *       401:
 *         description: Non autorisé
 */
const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/stats/summary', getExpenseStats);
router.get('/stats/monthly', getMonthlyStats);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;