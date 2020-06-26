const express = require('express');
//var flash = require('express-flash');
const app = express();

app.use('/Users', require('./Users'));
app.use('/Users', require('./Login'));
app.use('/Alerts', require('./Alerts'));
app.use('/Roles', require('./Roles'));
app.use('/Comments', require('./Comments'));
app.use('/CategoriaApi', require('./CategoriaApi'));
app.use('/Api', require('./Api'));

module.exports = app;