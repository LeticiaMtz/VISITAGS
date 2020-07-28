const express = require('express');
const subirArchivo = require('../libraries/subirArchivo(1)');
const fileUpload = require('express-fileupload')
const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs');
const app = express();

const Evidencias = require('../models/evidencias');
const Alerts = require('../models/Alerts');

app.use(fileUpload());

app.put('/upload/:ruta/:idAlert/:idEvidencia', (req, res) =>{
    let idAlert = req.params.idAlert;
    let idEvidencia = req.params.idEvidencia;
    let ruta = req.params.ruta;
    let archivo = req.files.archivo;
    console.log(archivo);
    let nombre = uniqid() + path.extname(archivo.name); //Path va a traer la extension del archivo.name

    if (!req.files) {
        return res.status(400).json({
            ok: false, 
            status: 400, 
            msg: 'No se a seleccionado ningun archivo',
            cnt: err
        })
    }

    switch(ruta){ 
        case 'evidencias':
            Alerts.findOne({'aJsnEvidencias._id': idEvidencia, _id: idAlert}, {'aJsnEvidencias.$':1}, async (err, evi)=>{
                if (err) {
                    subirArchivo.borraArchivo(nombre, 'evidencias');
                    return res.status(400).json({
                        ok: false,
                        status: 400, 
                        msg: 'No se pudo subir el archivo', 
                        cnt: err
                    });
                }

                let evidencia = evi.aJsnEvidencias[0];
                let nombreImagen = ruta + '/' + await subirArchivo.subirArchivo(archivo, ruta);      
                        console.log('se subio un archivo');
                           Alerts.findOneAndUpdate({'aJsnEvidencias._id': idEvidencia, _id: idAlert},{$set: {'aJsnEvidencias.$.strFileEvidencia': nombreImagen}}).then(resp => {
                            return res.status(200).json({
                                ok: true,
                                status: 200, 
                                msg: 'Se subio el archivo exitosamente',
                                cnt: resp
                            }); 
                        }).catch(err =>{
                            return res.status(400).json({
                                ok: false,
                                status: 400, 
                                mg: 'Algo salio mal', 
                                cnt: err
                            });
                        });
        
                });
        break;
        default: 
        return res.status(400).json({
            ok: false, 
            status: 400, 
            msg: 'Ruta no valida', 
            cnt: err
        });
    }   

});

module.exports = app;