const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  categorie: {
    type: String,
    required: true,
    enum: [
      'alimentation',
      'transport',
      'logement',
      'loisirs',
      'santé',
      'éducation',
      'shopping',
      'autres'
    ]
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  mois: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  annee: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Empêcher les doublons
budgetSchema.index({ user: 1, categorie: 1, mois: 1, annee: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);