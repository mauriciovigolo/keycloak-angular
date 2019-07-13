/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'keycloak-angular :: Heroes API',
      description:
        'APIs used by the keycloak-angular examples, only for demo and study purposes! Credits for the data: Dota from https://docs.opendota.com/ and Amiibos from https://www.amiiboapi.com/',
      version: '1.0.0'
    },
    license: {
      name: 'MIT'
    }
  },
  apis: ['**/*.router.js']
};

const swaggerDocument = swaggerJSDoc(swaggerOptions);

export const initSwagger = (app, path = '/api/docs') => {
  app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
