/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Evidencias = require('../models/evidencias');
const Alerts = require('../models/Alerts');
const { verificaToken } = require('../middlewares/autenticacion');


//|-----------------          Api POST de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una api                                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/registrar                        |
//|----------------------------------------------------------------------|
app.post('/registrar/:idAlert', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    const evidencias = new Evidencias(req.body);

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
                        '_id': req.params.idAlert
                    }, {
                        $push: {
                            aJsnEvidencias: evidencias
                        }
                    })
                        .then((alert) => {
                            return res.status(200).json({
                                ok: true,
                                resp: 200,
                                msg: 'Success: Informacion insertada correctamente.',
                                cont: {
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
app.get('/obtener/:idAlert', [verificaToken], (req, res) => {
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
                    cont: {
                        rutas
                    }
                });

            } else {

                return res.status(404).json({
                    ok: true,
                    resp: 404,
                    msg: 'Error: La alerta no existe o no cuenta con evidencias',
                    cont: {
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
                cont: {
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
app.put('/actualizar/:idAlert/:idEvidencia', [verificaToken], (req, res) => {
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
            cont: {
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
                cont: {
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
                    cont: {
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
app.delete('/eliminar/:idAlert/:idEvidencia', [verificaToken], (req, res) => {
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
                cont: {
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