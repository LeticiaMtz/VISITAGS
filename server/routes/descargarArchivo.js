const express = require('express');
const app = express();
const path = require('path');

app.get('/descarga/:fileName', (req, res) => {
    let name = req.params.fileName;

    let filePath = path.resolve(`${__dirname}../../../uploads/seguimiento/${name}`);
    console.log(filePath);

    res.download(filePath, name);
});

module.exports = app;