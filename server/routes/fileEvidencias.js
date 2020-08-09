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

app.put('/upload/:idAlert/:idSeguimiento', async(req, res) => {
    let idAlert = req.params.idAlert;
    let idSeguimiento = req.params.idSeguimiento;
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
            strNombreFile = await cargarImagenes.subirImagen(req.files.strFileEvidencia, 'seguimiento');
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
        strFileEvidencia: `/seguimiento/${strNombreFile}`,
        blnActivo: true
    });

    
    Alerts.findOneAndUpdate({ _id: idAlert,'aJsnSeguimiento._id': idSeguimiento}, { $push: {'aJsnSeguimiento.$.aJsnEvidencias': evidencia }}) .then(resp => {
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
          


    // switch (ruta) {
    //     case 'evidencias':
    //         Alerts.findOne({ 'aJsnEvidencias._id': idEvidencia, _id: idAlert }, { 'aJsnEvidencias.$': 1 }, async(err, evi) => {
    //             if (err) {
    //                 subirArchivo.borraArchivo(nombre, 'evidencias');
    //                 return res.status(400).json({
    //                     ok: false,
    //                     status: 400,
    //                     msg: 'No se pudo subir el archivo',
    //                     cnt: err
    //                 });
    //             }

    //             let nombreImagen = ruta + '/' + await subirArchivo.subirArchivo(archivo, ruta);
    //             console.log('se subio un archivo');
    //             Alerts.findOneAndUpdate({ 'aJsnEvidencias._id': idEvidencia, _id: idAlert }, { $set: { 'aJsnEvidencias.$.strFileEvidencia': nombreImagen } }).then(resp => {
    //                 return res.status(200).json({
    //                     ok: true,
    //                     status: 200,
    //                     msg: 'Se subio el archivo exitosamente',
    //                     cnt: resp
    //                 });
    //             }).catch(err => {
    //                 return res.status(400).json({
    //                     ok: false,
    //                     status: 400,
    //                     mg: 'Algo salio mal',
    //                     cnt: err
    //                 });
    //             });

    //         });
    //         break;
    //     default:
    //         return res.status(400).json({
    //             ok: false,
    //             status: 400,
    //             msg: 'Ruta no valida',
    //             cnt: err
    //         });


});

app.post('/registrar/:idAlert/:idEvidencia', async(req, res) => {

    let nombreImg;




});

module.exports = app;