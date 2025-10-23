const express = require('express');
const {
  getSolde,
  ajouterArgent,
  retirerArgent,
  getHistoriqueComplet
} = require('../controllers/balanceController');
const authMiddleware = require('../middleware/auth');
/**
 * @swagger
 * /api/balance:
 *   get:
 *     summary: Obtenir le solde actuel
 *     tags: [Balance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solde actuel récupéré avec succès
 *       401:
 *         description: Non autorisé
 */
/**
 * @swagger
 * /api/balance/depot:
 *   post:
 *     summary: Ajouter de l'argent (dépôt)
 *     tags: [Balance]
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
 *                 example: 10000
 *               description:
 *                 type: string
 *                 example: "Dépôt initial"
 *     responses:
 *       200:
 *         description: Dépôt effectué avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
/**
 * @swagger
 * /api/balance/retrait:
 *   post:
 *     summary: Retirer de l'argent
 *     tags: [Balance]
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
 *                 example: 5000
 *               description:
 *                 type: string
 *                 example: "Retrait pour courses"
 *     responses:
 *       200:
 *         description: Retrait effectué avec succès
 *       400:
 *         description: Données invalides ou solde insuffisant
 *       401:
 *         description: Non autorisé
 */
/**
 * @swagger
 * /api/balance/historique:
 *   get:
 *     summary: Obtenir l'historique complet des transactions
 *     tags: [Balance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
 *       401:
 *         description: Non autorisé
 */
const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);


router.get('/', getSolde);
router.post('/depot', ajouterArgent);
router.post('/retrait', retirerArgent);
router.get('/historique', getHistoriqueComplet);

module.exports = router;