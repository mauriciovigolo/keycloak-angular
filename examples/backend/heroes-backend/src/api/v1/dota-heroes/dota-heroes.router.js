/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import express from 'express';

import { list } from './dota-heroes.service';

import { authenticated } from '../../../core/config';

const router = express.Router();

/**
 * @swagger
 *
 * definitions:
 *  Hero:
 *    type: object
 *    properties:
 *      id:
 *        type: integer
 *      name:
 *        type: string
 *      localized_name:
 *        type: string
 *      primary_attr:
 *        type: string
 *      attack_type:
 *        type: string
 *      roles:
 *        type: Array
 *      legs:
 *        type: integer
 *  Heroes:
 *    allOf:
 *      - $ref: '#/definitions/Hero'
 */

/**
 * @swagger
 *
 * /v1/dota-heroes:
 *   get:
 *     tags:
 *      - dota-heroes
 *     summary: List Heroes
 *     description: Returns the list o dota heroes giving the possibility to search by name and primary attributes.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Text to search by name and primary attributes.
 *         schema:
 *          type: string
 *     responses:
 *       200:
 *         description: List of Dota Heroes
 *         schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Hero'
 */
router.get('', async (req, res) => {
  const { search, page, limit } = req.query;
  const result = list(search, page, limit);
  res.status(200).send(result);
});

module.exports = {
  router,
  path: '/v1/dota-heroes'
};
