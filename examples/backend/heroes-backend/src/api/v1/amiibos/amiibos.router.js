/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import express from 'express';

import { list } from './amiibos.service';

import { authenticated } from '../../../core/config';

const router = express.Router();

/**
 * @swagger
 *
 * definitions:
 *  Amiibo:
 *    type: object
 *    properties:
 *      amiiboSeries:
 *        type: string
 *      character:
 *        type: string
 *      gameSeries:
 *        type: string
 *      head:
 *        type: string
 *      image:
 *        type: string
 *      name:
 *        type: string
 *      release:
 *        type: object
 *      tail:
 *        type: string
 *      type:
 *        type: string
 */

/**
 * @swagger
 *
 * /v1/amiibos:
 *   get:
 *     tags:
 *      - amiibos
 *     summary: List Amiibos
 *     description: Returns the list of amiibos giving the possibility to search by name, series, character and type.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Text to search amiibos
 *         schema:
 *          type: string
 *     responses:
 *       200:
 *         description: List of Amiibos
 *         schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Amiibo'
 */
router.get('', async (req, res) => {
  const { search } = req.query;
  const result = list(search);
  res.status(200).send(result);
});

module.exports = {
  router,
  path: '/v1/amiibos'
};
