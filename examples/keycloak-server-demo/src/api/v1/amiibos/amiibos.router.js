/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import express from 'express';

const router = express.Router();

router.get('', async (req, res) => {
  let products = await productsService.list();
  res.status(200).send(products);
});

module.exports = {
  router,
  path: '/v1/amiibos'
};
