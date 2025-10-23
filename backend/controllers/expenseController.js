const Expense = require('../models/Expense');
const Balance = require('../models/Balance');

// @desc    Créer une nouvelle dépense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { titre, montant, categorie, date, description } = req.body;

    // Validation basique
    if (!titre || !montant || !categorie) {
      return res.status(400).json({
        success: false,
        message: 'Titre, montant et catégorie sont obligatoires'
      });
    }

    if (montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à 0'
      });
    }

    // VÉRIFICATION DU SOLDE
    let balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      balance = await Balance.create({
        user: req.user._id,
        soldeActuel: 0,
        historique: []
      });
    }

    if (balance.soldeActuel < montant) {
      return res.status(400).json({
        success: false,
        message: `Solde insuffisant. Solde actuel: ${balance.soldeActuel}Ar, Dépense: ${montant}Ar`
      });
    }

    // Créer la dépense
    const expense = await Expense.create({
      titre,
      montant,
      categorie,
      date: date || Date.now(),
      description,
      user: req.user._id
    });

    // DÉDUIRE DU SOLDE
    await balance.ajouterTransaction(
      'depense', 
      montant, 
      `Dépense: ${titre}`, 
      expense._id
    );

    res.status(201).json({
      success: true,
      message: 'Dépense créée avec succès',
      data: expense,
      nouveauSolde: balance.soldeActuel
    });

  } catch (error) {
    console.error('Erreur création dépense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la dépense'
    });
  }
};

// @desc    Récupérer toutes les dépenses de l'utilisateur
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtres optionnels
    const filter = { user: req.user._id };
    if (req.query.categorie) {
      filter.categorie = req.query.categorie;
    }
    if (req.query.month) {
      const year = req.query.year || new Date().getFullYear();
      const startDate = new Date(year, req.query.month - 1, 1);
      const endDate = new Date(year, req.query.month, 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur récupération dépenses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des dépenses'
    });
  }
};

// @desc    Récupérer une dépense spécifique
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }

    res.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('Erreur récupération dépense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la dépense'
    });
  }
};

// @desc    Mettre à jour une dépense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { titre, montant, categorie, date, description } = req.body;

    // Trouver la dépense existante
    const existingExpense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }

    // Vérifier le solde si le montant change
    if (montant && montant !== existingExpense.montant) {
      const balance = await Balance.findOne({ user: req.user._id });
      if (!balance) {
        return res.status(404).json({
          success: false,
          message: 'Solde non trouvé'
        });
      }

      const difference = montant - existingExpense.montant;
      
      // Vérifier si le nouveau montant dépasse le solde
      if (difference > 0 && balance.soldeActuel < difference) {
        return res.status(400).json({
          success: false,
          message: `Solde insuffisant pour cette modification. Différence: ${difference}Ar, Solde: ${balance.soldeActuel}Ar`
        });
      }

      // Mettre à jour le solde
      if (difference !== 0) {
        const typeOperation = difference > 0 ? 'augmentation' : 'réduction';
        await balance.ajouterTransaction(
          'ajustement', 
          Math.abs(difference), 
          `Ajustement dépense: ${existingExpense.titre} (${typeOperation})`,
          existingExpense._id
        );
      }
    }

    // Mettre à jour la dépense
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $set: {
          ...(titre && { titre }),
          ...(montant && { montant }),
          ...(categorie && { categorie }),
          ...(date && { date }),
          ...(description !== undefined && { description })
        }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Dépense mise à jour avec succès',
      data: updatedExpense
    });

  } catch (error) {
    console.error('Erreur mise à jour dépense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la dépense'
    });
  }
};

// @desc    Supprimer une dépense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }

    // Rembourser le solde
    const balance = await Balance.findOne({ user: req.user._id });
    if (balance) {
      await balance.ajouterTransaction(
        'depot', 
        expense.montant, 
        `Remboursement: ${expense.titre} (dépense supprimée)`,
        expense._id
      );
    }

    // Supprimer la dépense
    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Dépense supprimée avec succès',
      montantRembourse: expense.montant
    });

  } catch (error) {
    console.error('Erreur suppression dépense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la dépense'
    });
  }
};
// @desc    Récupérer les statistiques des dépenses
// @route   GET /api/expenses/stats/summary
// @access  Private
const getExpenseStats = async (req, res) => {
  try {
    const { month, year = new Date().getFullYear() } = req.query;
    
    let dateFilter = {};
    if (month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      dateFilter = { date: { $gte: startDate, $lt: endDate } };
    }

    const stats = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$categorie',
          total: { $sum: '$montant' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const totalDepenses = stats.reduce((sum, categorie) => sum + categorie.total, 0);

    res.json({
      success: true,
      data: {
        categories: stats,
        totalDepenses,
        moyenneParCategorie: stats.map(cat => ({
          ...cat,
          pourcentage: totalDepenses > 0 ? ((cat.total / totalDepenses) * 100).toFixed(1) : '0'
        }))
      }
    });

  } catch (error) {
    console.error('Erreur statistiques dépenses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du calcul des statistiques'
    });
  }
};

// @desc    Récupérer les dépenses par mois
// @route   GET /api/expenses/stats/monthly
// @access  Private
const getMonthlyStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyStats = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$montant' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Formater les résultats pour inclure tous les mois
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const formattedStats = allMonths.map(month => {
      const monthData = monthlyStats.find(stat => stat._id.month === month);
      return {
        month,
        total: monthData ? monthData.total : 0,
        count: monthData ? monthData.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        monthlyStats: formattedStats,
        totalYear: formattedStats.reduce((sum, month) => sum + month.total, 0)
      }
    });

  } catch (error) {
    console.error('Erreur statistiques mensuelles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du calcul des statistiques mensuelles'
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getMonthlyStats
};