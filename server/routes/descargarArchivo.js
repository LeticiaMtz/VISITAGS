const express = require('express');
const app = express();
const path = require('path');

app.get('/descargaSeguimiento/:fileName', (req, res) => {
    let name = req.params.fileName;

    let filePath = path.resolve(`${__dirname}../../../uploads/seguimiento/${name}`);
    console.log(filePath);

    res.download(filePath, name);
});

app.get('/descargaEvidencia/:fileName', (req, res) => {
    let name = req.params.fileName;

    let filePath = path.resolve(`${__dirname}../../../uploads/evidencias/${name}`);
    console.log(filePath);

    res.download(filePath, name);
});

module.exports = app;