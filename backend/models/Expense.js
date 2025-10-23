const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est obligatoire'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: [
      'alimentation',
      'transport', 
      'logement',
      'loisirs',
      'santé',
      'éducation',
      'shopping',
      'autres'
    ],
    default: 'autres'
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes par utilisateur
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);