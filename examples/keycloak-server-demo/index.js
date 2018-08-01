#!/usr/bin/env node
const express = require('express');
const utils = require('./utils');

const app = express();

app.listen(3000, utils.serverInitCallback);
