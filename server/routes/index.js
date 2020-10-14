const express = require('express');
const app = express();

app.use('/Users', require('./Users'));
app.use('/Alerts', require('./Alerts'));
app.use('/Api', require('./Api'));
app.use('/CategoriaApi', require('./CategoriaApi'));
app.use('/Roles', require('./Roles'));
app.use('/carreras', require('./carreras'));
app.use('/especialidad', require('./especialidad'));
app.use('/crde', require('./crde'));
app.use('/motivosCrde', require('./motivosCrde'));
app.use('/estatus', require('./estatus'));
app.use('/asignatura', require('./asignatura'));
app.use('/modalidad', require('./modalidad'));
app.use('/seguimiento', require('./seguimiento'));
app.use('/descargarArchivo', require('./descargarArchivo'));

module.exports = app;