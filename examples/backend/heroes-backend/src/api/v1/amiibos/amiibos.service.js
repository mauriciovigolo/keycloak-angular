/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { amiibos } from './amiibos.data';

import { attributeMatches } from '../../../core/data';

const matchSearchCriteria = ({ amiiboSeries, character, gameSeries, name, type }, search) => {
  return (
    attributeMatches(amiiboSeries, search) |
    attributeMatches(character, search) |
    attributeMatches(gameSeries, search) |
    attributeMatches(name, search) |
    attributeMatches(type, search)
  );
};

export const list = search => {
  let result = { total: amiibos.length, list: amiibos };

  if (search) {
    const matchedAmiibos = amiibos.filter(amiibo => matchSearchCriteria(amiibo, search));
    result = { total: matchedAmiibos.length, list: matchedAmiibos };
  }

  return result;
};
