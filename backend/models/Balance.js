const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  soldeActuel: {
    type: Number,
    default: 0,
    min: 0
  },
  historique: [{
    type: {
      type: String,
      enum: ['depot', 'retrait', 'depense', 'salaire', 'ajustement'],
      required: true
    },
    montant: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'historique.referenceModel'
    },
    referenceModel: {
      type: String,
      enum: ['Expense', null]
    },
    soldeApres: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Méthode pour ajouter une transaction à l'historique
balanceSchema.methods.ajouterTransaction = function(type, montant, description, reference = null) {
  const soldeApres = type === 'depense' || type === 'retrait' 
    ? this.soldeActuel - montant 
    : this.soldeActuel + montant;

  this.historique.push({
    type,
    montant,
    description,
    reference,
    referenceModel: reference ? 'Expense' : null,
    soldeApres,
    date: new Date()
  });

  this.soldeActuel = soldeApres;
  return this.save();
};

module.exports = mongoose.model('Balance', balanceSchema);