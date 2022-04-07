const express = require('express');
const app = express();

app.use('/Users', require('./Users'));

module.exports = app;