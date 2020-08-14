/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Seguimiento = require('../models/seguimiento');
const Evidencias = require('../models/evidencias');
const Alerts = require('../models/Alerts');
const User = require('../models/Users');
const { verificaToken } = require('../middlewares/autenticacion');

const cargarImagenes = require('../libraries/cargaImagenes');
const { isArray } = require('underscore');
const { path } = require('./crde');
const rutaImg = 'seguimiento';

//|-----------------          Api POST de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una api                                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/registrar                        |
//|----------------------------------------------------------------------|
app.post('/registrar/:idAlert', [], async(req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    const seguimiento = new Seguimiento(req.body);

    let err = seguimiento.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al registrar la evidencia',
            cont: {
                err
            }
        });
    }


    
    
        
        if (!req.files) {
            Alerts.findOneAndUpdate({
                '_id': req.params.idAlert
            }, {
                $push: {
                    aJsnSeguimiento: seguimiento
                }
            })
            .then((seguimiento) => {
                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: 'Success: Informacion insertada correctamente.',
                    cont: seguimiento.length, 
                    cnt: {
                        seguimiento
                    }
                });
            })
            .catch((err) => {
                return res.status(500).json({
                    ok: false,
                    resp: 500,
                    msg: 'Error: Error al registrar la evidencia',
                    cont: {
                        err: err.message
                    }
                });
            });
        }

        if(req.files){

        let aJsnEvidencias = [];
        let nombreImg;
        let arrFiles = req.files.strFileEvidencia;
        console.log(arrFiles)
        if(isArray(arrFiles)){
        for (const archivo of arrFiles) {
            await cargarImagenes.subirImagen(archivo, rutaImg).then((fileName) => {

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
    
        }
    }else{
        await cargarImagenes.subirImagen(arrFiles, rutaImg).then((fileName) => {

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

           
    }

        
        
        const evidencias = new Evidencias({

            strNombre: req.body.strNombre,
            strFileEvidencia: nombreImg,
            blnStatus: req.body.blnStatus

        });
        for (const iter of aJsnEvidencias) {
            seguimiento.aJsnEvidencias.push(evidencias);
            
        }
           Alerts.findOneAndUpdate({
                        '_id': req.params.idAlert
                    }, {
                        $push: {
                            aJsnSeguimiento: seguimiento
                        }
                    })
                    .then((seguimiento) => {
                        return res.status(200).json({
                            ok: true,
                            resp: 200,
                            msg: 'Success: Informacion insertada correctamente.',
                            cont: seguimiento.length, 
                            cnt: {
                                seguimiento
                            }
                        });
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            ok: false,
                            resp: 500,
                            msg: 'Error: Error al registrar la evidencia',
                            cont: {
                                err: err.message
                            }
                        });
                    });
                }
        if((err) => {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error: Error interno',
                cont: {
                    err: err.message
                }
            });
        });
    });
             




//|-----------------          Api POST de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una api                                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/registrar                        |
//|----------------------------------------------------------------------|
app.post('/registrar/:idAlert/:idSeguimiento', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    const evidencias = new Evidencias(req.body);

    console.log(evidencias);

    let err = evidencias.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al registrar el motivo',
            cont: {
                err
            }
        });
    }
                    Alerts.findOneAndUpdate({
                        '_id': req.params.idAlert, 
                        'aJsnSeguimiento._id': req.params.idSeguimiento
                    }, {
                        $push: {
                            'aJsnSeguimiento.$.aJsnEvidencias': evidencias
                        }
                    })
                        .then((alert) => {
                            return res.status(200).json({
                                ok: true,
                                resp: 200,
                                msg: 'Success: Informacion insertada correctamente.',
                                cont: evidencias.length,
                                cnt: {
                                    evidencias
                                }
                            });
                        })
                        .catch((err) => {
                            return res.status(500).json({
                                ok: false,
                                resp: 500,
                                msg: 'Error: Error al registrar el motivo',
                                cont: {
                                    err: err.message
                                }
                            });
                        });
                })
        if ((err) => {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error: Error interno',
                cont: {
                    err: err.message
                }
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
    let idAlert = req.params.idAlert;
    if (process.log) {
        console.log(' params ', req.params);
    }
    Alerts.findById(idAlert, { aJsnSeguimiento: 1}).populate([{path: 'aJsnSeguimiento.idUser', select: 'strName idRole strLastName strMotherLastName', populate: { path: 'idRole', select: 'strRole' }}]).sort({ created_at: 'desc' })
    .exec((err, seguimiento) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al encontrar el seguimeinto de la alerta ',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Success: Informacion obtenida correctamente.',
            cont: seguimiento.length,
            cnt: seguimiento
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
app.put('/actualizar/:idAlert/:idSeguimiento', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    let seguimiento = new Seguimiento({
        _id: req.params.idSeguimiento,
        idUser: req.body.idUser,
        idEstatus: req.body.idEstatus,
        strComentario: req.body.strComentario,
        aJsnEvidencias: req.body.aJsnEvidencias,
        blnStatus: req.body.blnStatus
    });

    let err = seguimiento.validateSync();

    if (err) {

        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al actualizar la api',
            cont: {
                err
            }
        });

    }

    Alerts.aggregate([{
            $unwind: '$aJsnSeguimiento'
        },
        {
            $match: {
                'aJsnSeguimiento.blnStatus': true,
                'aJsnSeguimineto.idUser': req.body.idUser, 
                'aJsnSeguimiento.idEstatus': req.body.idEstatus, 
                'aJsnSeguimiento.strComentario': req.body.strComentario, 
                'aJsnSeguimiento.aJsnEvidencias': req.body.aJsnEvidencias, 

            }
        },
        {
            $replaceRoot: {
                newRoot: '$aJsnSeguimiento'
            }
        }
    ], (err, resp) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error: Error del servidor',
                cont: {
                    err
                }
            });
        }

        if (resp.length > 0) {
            if (req.params.idSeguimiento != resp[0]._id) {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: 'Error: El seguimeinto ya se encuentra registrada',
                    cont: {
                        resp
                    }
                });
            }
        }


        Alerts.findOneAndUpdate({
                '_id': req.params.idAlert,
                'aJsnSeguimiento._id': req.params.idSeguimiento
            }, {
                $set: {
                    
                'aJsnSeguimineto.idUser': seguimiento.idUser, 
                'aJsnSeguimiento.idEstatus': seguimiento.idEstatus, 
                'aJsnSeguimiento.strComentario': seguimiento.strComentario, 
                'aJsnSeguimiento.aJsnEvidencias': seguimiento.aJsnEvidencias, 
                'aJsnSeguimiento.blnStatus': seguimiento.blnStatus

                }
            })
            .then((ruta) => {

                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: 'Success: Informacion actualizada correctamente.',
                    cont: {
                        ruta
                    }
                });

            })
            .catch((err) => {

                return res.status(500).json({
                    ok: false,
                    resp: 500,
                    msg: 'Error: Error al modificar la evidencia',
                    cont: {
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
app.delete('/eliminar/:idAlert/:idSeguimeinto', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    Alerts.findOneAndUpdate({
            '_id': req.params.idAlert,
            'aJsnSeguimiento._id': req.params.idSeguimiento
        }, {
            $set: { 'aJsnSeguimiento.$.blnStatus': false }
        })
        .populate('aJsnSeguimiento')
        .then((resp) => {

            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Informacion eliminada correctamente.',
                cont: resp.length,
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
                cont: {
                    err: err.message
                }
            });

        });
});


module.exports = app;