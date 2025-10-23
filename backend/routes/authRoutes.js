const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Nouveau Nom"
 *               email:
 *                 type: string
 *                 example: "nouveau@email.com"
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.put('/profile',authMiddleware, updateProfile);

/**
 * @swagger
 * /api/auth/password:
 *   put:
 *     summary: Changer le mot de passe
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "ancienMotDePasse"
 *               newPassword:
 *                 type: string
 *                 example: "nouveauMotDePasse"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Mot de passe actuel incorrect
 *       401:
 *         description: Non autorisé
 */
router.put('/password',authMiddleware, changePassword);

module.exports = router;