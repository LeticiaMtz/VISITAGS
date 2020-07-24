const express = require('express');
const app = express();

app.use('/Users', require('./Users'));
app.use('/Users', require('./Login'));
app.use('/Alerts', require('./Alerts'));
app.use('/Roles', require('./Roles'));
app.use('/Comments', require('./Comments'));
app.use('/CategoriaApi', require('./CategoriaApi'));
app.use('/Api', require('./Api'));
app.use('/carreras', require('./carreras'));
app.use('/especialidad', require('./especialidad'));
app.use('/crde', require('./crde'));
app.use('/motivosCrde', require('./motivosCrde'));
app.use('/estatus', require('./estatus'));
app.use('/asignatura',require('./asignatura'));
app.use('/evidencias',require('./evidencias'));
app.use('/seguimiento',require('./seguimiento'));
app.use('/fileEvidencias',require('./fileEvidencias'));

module.exports = app;