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
            err:{
                message: 'No se a seleccionado ningun archivo'
            }
        })
    }

    switch(ruta){ 
        case 'evidencias':
            Alerts.findOne({'aJsnEvidencias._id': idEvidencia, _id: idAlert}, {'aJsnEvidencias.$':1}, async (err, evi)=>{
                if (err) {
                    subirArchivo.borraArchivo(nombre, 'evidencias');
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                let evidencia = evi.aJsnEvidencias[0];
                let nombreImagen = ruta + '/' + await subirArchivo.subirArchivo(archivo, ruta);      
                        console.log('se subio un archivo');
                           Alerts.findOneAndUpdate({'aJsnEvidencias._id': idEvidencia, _id: idAlert},{$set: {'aJsnEvidencias.$.strFileEvidencia': nombreImagen}}).then(resp => {
                            return res.status(200).json({
                                ok: true,
                                resp
                            }); 
                        }).catch(err =>{
                            return res.status(400).json({
                                ok: false,
                                err
                            });
                        });
        
                });
                // Alerts.aJsnEvidencias.strFileEvidencia = nombreArchivo;
        
                // Alerts.save((err, eviDB)=>{
                //     if (err) {
                //         subirArchivo.borraArchivo(nombreArchivo, 'evidencias');
                //         return res.status(400).json({
                //             ok: false,
                //             err
                //         });
                //     }
        
                //     return res.status(200).json({
                //         ok: true, 
                //         eviDB
                //     });
                // });
        

        break;
        default: 
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'Ruta no valida'
            }
        });
    }   

});

function fileEvidencias(id, res, nombreArchivo, archivo, ruta){ 
 
}




function borrarArchivo(nombreArchivo, ruta){
    let pathImg = path.resolve(__dirname, `../../uploads/${ruta}/${nombreArchivo}`);
    if(fs.existsSync(pathImg)){
        fs.unlinkSync(pathImg);

    }
    console.log('Archivo borrado con exito');
}

module.exports = app;