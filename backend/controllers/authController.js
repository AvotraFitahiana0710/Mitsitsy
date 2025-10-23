const User = require('../models/User');
const generateToken = require('../config/generateToken');

// @desc    Inscription utilisateur
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    // Validation basique
    if (!nom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          _id: user._id,
          nom: user.nom,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont obligatoires'
      });
    }

    // Trouver l'utilisateur et inclure le mot de passe
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          _id: user._id,
          nom: user.nom,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

// @desc    Récupérer le profil utilisateur
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        nom: req.user.nom,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { nom, email } = req.body;

    // Validation
    if (!nom && !email) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un champ (nom ou email) doit être fourni'
      });
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }
    }

    // Préparer les champs à mettre à jour
    const updateFields = {};
    if (nom) updateFields.nom = nom;
    if (email) updateFields.email = email;

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
};
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
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe changé
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit être différent de l\'actuel'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de mot de passe'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword
};