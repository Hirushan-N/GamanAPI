const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GamanAPI',
      version: '1.0.0',
      description: 'API documentation for the Gaman bus booking system',
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Global base URL
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
