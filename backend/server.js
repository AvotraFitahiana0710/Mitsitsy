const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger'); // AJOUT
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - DB State: ${mongoose.connection.readyState}`);
  next();
});

// Middleware pour vérifier si MongoDB est connecté
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Base de données en cours de connexion, veuillez réessayer dans quelques secondes'
    });
  }
  next();
};

// Connexion MongoDB
console.log('Début de la connexion MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB CONNECTÉ avec succès !');
    console.log('Base de données:', mongoose.connection.db?.databaseName);
  })
  .catch((error) => {
    console.error('ERREUR MongoDB:', error.message);
    console.log('Détails de l\'URL:', process.env.MONGODB_URI ? 'URL présente' : 'URL manquante');
  });

// Événements MongoDB
mongoose.connection.on('connecting', () => {
  console.log('MongoDB connecting...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Routes avec vérification de connexion DB
app.use('/api/auth', checkDBConnection, require('./routes/authRoutes'));
app.use('/api/expenses', checkDBConnection, require('./routes/expenseRoutes'));
app.use('/api/balance', checkDBConnection, require('./routes/balanceRoutes'));

// Route de base (sans vérification DB)
app.get('/', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    message: 'API Gestion de Dépenses - Backend',
    version: '1.0.0',
    database: dbStates[mongoose.connection.readyState] || 'unknown'
  });
});

// Route santé détaillée
app.get('/health', (req, res) => {
  const isHealthy = mongoose.connection.readyState === 1;
  
  res.json({
    success: isHealthy,
    database: {
      state: mongoose.connection.readyState,
      status: isHealthy ? 'healthy' : 'unhealthy',
      name: mongoose.connection.db?.databaseName || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
});
// SWAGGER UI - Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Mitsitsy API Docs"
}));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`CORS activé pour: http://localhost:5173`);
  console.log(`En attente de la connexion MongoDB...`);
});