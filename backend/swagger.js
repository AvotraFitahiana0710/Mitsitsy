const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mitsitsy - API Gestion de Dépenses',
      version: '1.0.0',
      description: 'API complète pour l\'application de gestion de dépenses Mitsitsy',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Seulement les routes d'abord
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };