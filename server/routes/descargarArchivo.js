const express = require('express');
const app = express();
const path = require('path');

//|---------------Api GET Descargar archivos de seguimiento--------------|
//| Creada por: Martin Palacios                                          |
//| Api que descarga archivos de seguimiento                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/descargaSeguimiento/:fileName'       |
//|----------------------------------------------------------------------|
app.get('/descargaSeguimiento/:fileName', (req, res) => {
    let name = req.params.fileName;

    let filePath = path.resolve(`${__dirname}../../../uploads/seguimiento/${name}`);
    console.log(filePath);

    res.download(filePath, name);
});

//|---------------Api GET Descargar archivos de evidencia----------------|
//| Creada por: Martin Palacios                                          |
//| Api que descarga archivos de evidencia                               |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/descargaEvidencia/:fileName'         |
//|----------------------------------------------------------------------|
app.get('/descargaEvidencia/:fileName', (req, res) => {
    let name = req.params.fileName;

    let filePath = path.resolve(`${__dirname}../../../uploads/evidencias/${name}`);
    console.log(filePath);

    res.download(filePath, name);
});

module.exports = app;