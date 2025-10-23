const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 6
  }
}, {
  timestamps: true
});

// Hash le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Ajoute cette méthode après les autres méthodes
userSchema.methods.creerSoldeInitial = async function() {
  const Balance = require('./Balance');
  const balanceExistante = await Balance.findOne({ user: this._id });
  
  if (!balanceExistante) {
    return await Balance.create({
      user: this._id,
      soldeActuel: 0,
      historique: []
    });
  }
  return balanceExistante;
};

module.exports = mongoose.model('User', userSchema);