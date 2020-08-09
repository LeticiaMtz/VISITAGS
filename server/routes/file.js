const express = require('express');
const subirArchivo = require('../libraries/subirArchivo(1)');
const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs');
const app = express();

// SUBIR LOS ARCHIVOS 
const cargarImagenes = require('../libraries/cargaImagenes');
const rutaImg = 'evidencias';

const Evidencias = require('../models/evidencias');
const Alerts = require('../models/Alerts');

app.put('/upload/:idAlert', async(req, res) => {
    let idAlert = req.params.idAlert;
    let strNombreFile = '';

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'No se a seleccionado ningun archivo',
            cnt: req.files
        });
    } else {
        try {
            strNombreFile = await cargarImagenes.subirImagen(req.files.strFileEvidencia, 'evidencias');
        } catch (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                mg: 'Algo salio mal',
                cnt: err
            });
        }
    }

    let evidencia = new Evidencias({
        strNombre: strNombreFile,
        strFileEvidencia: `/evidencias/${strNombreFile}`,
        blnActivo: true
    });

    
    Alerts.findOneAndUpdate({ _id: idAlert}, { $push: {'aJsnEvidencias': evidencia }}) .then(resp => {
        if(!resp){
            return  res.status(404).json({
                ok: false, 
                status: 400, 
                msg: "Archivo no encontrado", 
                cnt: resp
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se subio el archivo exitosamente',
            cnt: resp
        });
    }).catch(err => {
        return res.status(400).json({
            ok: false,
            status: 400,
            mg: 'Algo salio mal',
            cnt: err
        });
    });
});
module.exports = app;        