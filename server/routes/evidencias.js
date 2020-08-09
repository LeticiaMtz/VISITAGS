/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Evidencias = require('../models/evidencias');
const Alerts = require('../models/Alerts');
const {} = require('../middlewares/autenticacion');

// SUBIR LOS ARCHIVOS 
const cargarImagenes = require('../libraries/cargaImagenes');
const rutaImg = 'evidencias';

//|-----------------          Api POST de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una api                                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/registrar                        |
//|----------------------------------------------------------------------|
app.post('/registrar/:idAlert', [], async(req, res) => {

    let nombreImg;
    let aJsnEvidencias = [];

    await Alerts.findOne({ 'strNombre': req.body.strNombre }).then(async(resp) => {
        if (resp) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'La evidencia ya se encuentra registrado en la base de datos.',
                cont: {
                    err: req.body.strNombre
                }
            });
        }
        
        if (!req.files) {
            return res.status(400).json({
                ok: false,
                resp: '400',
                msg: 'No se ha seleccionado ningún archivo',
                cont: {
                    file: req.files
                }
            });
        }

        console.log(req.files.strFileEvidencia, 'reqqq');
        await cargarImagenes.subirImagen(req.files.strFileEvidencia, rutaImg).then((fileName) => {

            nombreImg = fileName;
            aJsnEvidencias.push(nombreImg);


        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error al procesar el archivo',
                cont: {
                    err: err.message
                }
            });
        });

        const evidencias = new Evidencias({

            strNombre: req.body.strNombre,
            strFileEvidencia: nombreImg,
            blnStatus: req.body.blnStatus

        });
        await evidencias.save().then((evidencia) => {

            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'La evidencia se ha registrado exitosamente.',
                cont: {
                    evidencia
                }
            });
        }).catch((err) => {
            cargarImagenes.borrarImagen(nombreImg, rutaImg);
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error al insertar registrar una evidencia.',
                cont: {
                    err: err.message
                }
            });
        });
    });

});



//|-----------------          Api GET de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de apis registradas                       |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/obtener                          |
//|----------------------------------------------------------------------|
app.get('/obtener/:idAlert', [], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
    }
    Alerts.aggregate([{
                $unwind: '$aJsnEvidencias'
            },
            {
                $match: {
                    '_id': mongoose.Types.ObjectId(req.params.idAlert),
                    'blnStatus': true
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$aJsnEvidencias'
                }
            }
        ]).sort({ created_at: 'desc' })
        .then((rutas) => {

            if (rutas.length > 0) {

                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: 'Success: Informacion obtenida correctamente.',
                    cont: rutas.length,
                    cnt: {
                        rutas
                    }
                });

            } else {

                return res.status(404).json({
                    ok: true,
                    resp: 404,
                    msg: 'Error: La alerta no existe o no cuenta con evidencias',
                    cnt: {
                        rutas
                    }
                });

            }

        })
        .catch((err) => {

            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error: Error al obtener las apis de la categoría.",
                cnt: {
                    err: err.message
                }
            });

        });

});

//|-----------------          Api PUT de api             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una api                                            |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/actualizar/idCategoria/idApi     |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idAlert/:idEvidencia', [], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    let evidencias = new Evidencias({
        _id: req.params.idEvidencia,
        strNombre: req.body.strNombre,
        strFileEvidencia: req.body.strFileEvidencia,
        blnStatus: req.body.blnStatus
    });

    let err = evidencias.validateSync();

    if (err) {

        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al actualizar la api',
            cnt: {
                err
            }
        });

    }

    Alerts.aggregate([{
            $unwind: '$aJsnEvidencias'
        },
        {
            $match: {
                'aJsnEvidencias.blnStatus': true,
                'aJsnEvidencias.strNombre': req.body.strNombre,
                'aJsnEvidencias.strFileEvidencia': req.body.strFileEvidencia,

            }
        },
        {
            $replaceRoot: {
                newRoot: '$aJsnEvidencias'
            }
        }
    ], (err, resp) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error: Error del servidor',
                cnt: {
                    err
                }
            });
        }

        if (resp.length > 0) {
            if (req.params.idEvidencia != resp[0]._id) {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: 'Error: La evidencia ya se encuentra registrada',
                    cnt: {
                        resp
                    }
                });
            }
        }


        Alerts.findOneAndUpdate({
                '_id': req.params.idAlert,
                'aJsnEvidencias._id': req.params.idEvidencia
            }, {
                $set: {
                    'aJsnEvidencias.$.strNombre': evidencias.strNombre,
                    'aJsnEvidencias.$.strFileEvidencia': evidencias.strFileEvidencia,
                    'aJsnEvidencias.$.blnStatus': api.blnStatus
                }
            })
            .then((ruta) => {

                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: 'Success: Informacion actualizada correctamente.',
                    cont: ruta.length,
                    cnt: {
                        ruta
                    }
                });

            })
            .catch((err) => {

                return res.status(500).json({
                    ok: false,
                    resp: 500,
                    msg: 'Error: Error al modificar la evidencia',
                    cnt: {
                        err
                    }
                });

            });
    });

});

//|-----------------          Api DELETE de api          ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una api                                              |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/eliminar/idCategoria/idApi       |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idAlert/:idEvidencia', [], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    Alerts.findOneAndUpdate({
            '_id': req.params.idAlert,
            'aJsnEvidencias._id': req.params.idEvidencia
        }, {
            $set: { 'aJsnEvidencias.$.blnStatus': false }
        })
        .populate('aJsnEvidencias')
        .then((resp) => {

            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Informacion insertada correctamente.',
                cnt: {
                    resp
                }
            });

        })
        .catch((err) => {

            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error: Error al eliminar la api.',
                cnt: {
                    err: err.message
                }
            });

        });
});


module.exports = app;