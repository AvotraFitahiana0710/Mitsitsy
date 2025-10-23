const Balance = require('../models/Balance');
const User = require('../models/User');

// @desc    Récupérer le solde actuel
// @route   GET /api/balance
// @access  Private
const getSolde = async (req, res) => {
  try {
    let balance = await Balance.findOne({ user: req.user._id });
    
    // Créer un solde s'il n'existe pas
    if (!balance) {
      const user = await User.findById(req.user._id);
      balance = await Balance.create({
        user: user._id,
        soldeActuel: 0,
        historique: []
      });
    }

    res.json({
      success: true,
      data: {
        soldeActuel: balance.soldeActuel,
        historique: balance.historique.slice(-10).reverse()
      }
    });

  } catch (error) {
    console.error('Erreur récupération solde:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du solde'
    });
  }
};

// @desc    Ajouter de l'argent (dépôt, salaire, etc.)
// @route   POST /api/balance/depot
// @access  Private
const ajouterArgent = async (req, res) => {
  try {
    const { montant, type = 'depot', description } = req.body;

    if (!montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à 0'
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Une description est obligatoire'
      });
    }

    let balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      // Créer un solde s'il n'existe pas
      balance = await Balance.create({
        user: req.user._id,
        soldeActuel: 0,
        historique: []
      });
    }

    await balance.ajouterTransaction(type, montant, description);

    res.json({
      success: true,
      message: `${type === 'salaire' ? 'Salaire' : 'Argent'} ajouté avec succès`,
      data: {
        soldeActuel: balance.soldeActuel,
        montantAjoute: montant
      }
    });

  } catch (error) {
    console.error('Erreur ajout argent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'ajout d\'argent'
    });
  }
};

// @desc    Retirer de l'argent (sans créer de dépense)
// @route   POST /api/balance/retrait
// @access  Private
const retirerArgent = async (req, res) => {
  try {
    const { montant, description } = req.body;

    if (!montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à 0'
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Une description est obligatoire'
      });
    }

    const balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Solde non trouvé'
      });
    }

    if (balance.soldeActuel < montant) {
      return res.status(400).json({
        success: false,
        message: 'Solde insuffisant pour ce retrait'
      });
    }

    await balance.ajouterTransaction('retrait', montant, description);

    res.json({
      success: true,
      message: 'Retrait effectué avec succès',
      data: {
        soldeActuel: balance.soldeActuel,
        montantRetire: montant
      }
    });

  } catch (error) {
    console.error('Erreur retrait argent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du retrait'
    });
  }
};

// @desc    Historique complet des transactions
// @route   GET /api/balance/historique
// @access  Private
const getHistoriqueComplet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Solde non trouvé'
      });
    }

    // Trier l'historique par date décroissante et paginer
    const historiqueTrie = balance.historique
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + limit);

    const total = balance.historique.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        soldeActuel: balance.soldeActuel,
        historique: historiqueTrie,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'historique'
    });
  }
};

module.exports = {
  getSolde,
  ajouterArgent,
  retirerArgent,
  getHistoriqueComplet
};