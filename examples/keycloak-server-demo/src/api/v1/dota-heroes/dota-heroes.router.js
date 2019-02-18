/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import express from 'express';

import { dotaHeroes } from './dota-heroes.data';

const router = express.Router();

router.get('', async (req, res) => {
  res.status(200).send(dotaHeroes);
});

module.exports = {
  router,
  path: '/v1/dota-heroes'
};
