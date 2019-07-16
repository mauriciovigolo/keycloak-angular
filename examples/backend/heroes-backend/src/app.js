#!/usr/bin/env node

/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import express from 'express';
import cors from 'cors';

import { appPort, initDemoApp, serverInitCallback } from './core/config/app.config';
import { initKeycloak } from './core/config/keycloak.config';
import { RouterConfig } from './core/config/router.config';
import { initSwagger } from './core/config/swagger.config';

// Init App
initDemoApp();
const app = express();

// Middleware
app.use(cors());

// Init Routers
const { routers } = new RouterConfig(app);

// Swagger
initSwagger(app);

// Security -> Keycloak
//initKeycloak(app);

app.listen(appPort, serverInitCallback);
