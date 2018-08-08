#!/usr/bin/env node

/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

const express = require('express');
const utils = require('./src/core/utils');

const app = express();

app.listen(3000, utils.serverInitCallback);
