const Joi = require('joi');

const createExpenseValidation = Joi.object({
  titre: Joi.string().max(100).required().messages({
    'string.empty': 'Le titre est obligatoire',
    'string.max': 'Le titre ne peut pas dépasser 100 caractères'
  }),
  montant: Joi.number().positive().required().messages({
    'number.positive': 'Le montant doit être supérieur à 0',
    'number.base': 'Le montant doit être un nombre'
  }),
  categorie: Joi.string().valid(
    'alimentation',
    'transport',
    'logement',
    'loisirs',
    'santé',
    'éducation',
    'shopping',
    'autres'
  ).required().messages({
    'any.only': 'Catégorie invalide'
  }),
  date: Joi.date().max('now').messages({
    'date.max': 'La date ne peut pas être dans le futur'
  }),
  description: Joi.string().max(500).allow('')
});

const updateExpenseValidation = Joi.object({
  titre: Joi.string().max(100),
  montant: Joi.number().positive(),
  categorie: Joi.string().valid(
    'alimentation',
    'transport',
    'logement',
    'loisirs',
    'santé',
    'éducation',
    'shopping',
    'autres'
  ),
  date: Joi.date().max('now'),
  description: Joi.string().max(500).allow('')
});

module.exports = {
  createExpenseValidation,
  updateExpenseValidation
};