/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Motivo = require('../models/motivosCrde');
const Crde = require('../models/crde');
const { verificaToken } = require('../middlewares/autenticacion');

//|----------------- Api POST de MotivosCrde --------------------|
//| Creada por: Leticia Moreno                                   |
//| Api que registra un motivoCrde                               |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/motivosCrde/registrar/idCrde |
//|--------------------------------------------------------------|
app.post('/registrar/:idCrde', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    const motivo = new Motivo(req.body);

    let err = motivo.validateSync();

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

    Crde.findOne({
        '_id': req.params.idCrde,
        'aJsnMotivo.strNombre': motivo.strNombre,
        // 'aJsnMotivo.strClave':  motivo.strClave,
        'aJsnMotivo.blnStatus': true
    }).then((resp) => {
        if (resp !== null) {
            return res.status(400).send({
                ok: false,
                resp: 400,
                msg: 'Error el motivo ya se encuentra registrado',
                cont: resp.length, 
                cnt: {
                    resp
                }
            })
        } else {
            Crde.findOne({
                '_id': req.params.idCrde,
                'aJsnMotivo.strClave': motivo.strClave,
                'aJsnMotivo.blnStatus': true
            }).then((resp) => {
                if (resp !== null) {
                    return res.status(400).send({
                        ok: false,
                        resp: 400,
                        msg: 'Error la clave ya se encuentra registrado',
                        cont: {
                            resp
                        }
                    })
                } else {
                    Crde.findOneAndUpdate({
                        '_id': req.params.idCrde
                    }, {
                        $push: {
                            aJsnMotivo: motivo
                        }
                    })
                        .then((crde) => {
                            return res.status(200).json({
                                ok: true,
                                resp: 200,
                                msg: 'Success: Informacion insertada correctamente.',
                                cont: motivo.length, 
                                cnt: {
                                    motivo
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
                }
            })
        }

    })
        .catch((err) => {
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

//|-----------------   Api GET de motivosCrde -----------------|
//| Creada por: Leticia Moreno                                 |
//| Api que ontine listado de los motivosCrde                  |
//| modificada por:                                            |
//| Fecha de modificacion:                                     |
//| cambios:                                                   |
//| Ruta: http://localhost:3000/api/motivosCrde/obtener/idCrde |
//|------------------------------------------------------------|
app.get('/obtener/:idCrde', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
    }
    Crde.aggregate([{
                $unwind: '$aJsnMotivo'
            },
            {
                $match: {
                    '_id': mongoose.Types.ObjectId(req.params.idCrde),
                    'blnStatus': true
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$aJsnMotivo'
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
                    msg: 'Error: La categoria de crde no existe o no cuenta con rutas de motivos',
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
                msg: "Error: Error al obtener los motivos de las categorias crde",
                cont: {
                    err: err.message
                }
            });

        });

});
//|-----------------  Api PUT de MotivosCrde -----------------------------|
//| Creada por: Leticia Moreno                                            |
//| Api que actualiza un motivoCrde                                       |
//| modificada por:                                                       |
//| Fecha de modificacion:                                                |
//| cambios:                                                              |
//| Ruta: http://localhost:3000/api/motivosCrde/actualizar/idCrde/idMoivo |
//|-----------------------------------------------------------------------|
app.put('/actualizar/:idCrde/:idMotivo', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    let motivo = new Motivo({
        _id: req.params.idMotivo,
        strNombre: req.body.strNombre,
        strClave: req.body.strClave,
        blnStatus: req.body.blnStatus
    });

    let err = motivo.validateSync();

    if (err) {

        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al actualizar el motivo',
            cont: {
                err
            }
        });

    }

    Crde.aggregate([{
            $unwind: '$aJsnMotivo'
        },
        {
            $match: {
                'aJsnMotivo.blnStatus': true,
                'aJsnMotivo.strNombre': req.body.strNombre,
                'aJsnMotivo.strClave': req.body.strClave
            }
        },
        {
            $replaceRoot: {
                newRoot: '$aJsnMotivo'
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
            if (req.params.idMotivo != resp[0]._id) {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: 'Error: El motivo ya se encuentra registrado',
                    cont: {
                        resp
                    }
                });
            }
        }


        Crde.findOneAndUpdate({
                '_id': req.params.idCrde,
                'aJsnMotivo._id': req.params.idMotivo
            }, {
                $set: {
                    'aJsnMotivo.$.strNombre': motivo.strNombre,
                    'aJsnMotivo.$.strClave': motivo.strClave,
                    'aJsnMotivo.$.blnStatus': motivo.blnStatus
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
                    msg: 'Error: Error al modificar el motivo',
                    cont: {
                        err
                    }
                });

            });
    });

});

//|----------------- Api DELETE de MotivosCrde ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina un motivo Crde                                       |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/motivosCrde/eliminar/idCrde/idMotivo |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idCrde/:idMotivo', [verificaToken], (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    Crde.findOneAndUpdate({
            '_id': req.params.idCrde,
            'aJsnMotivo._id': req.params.idMotivo
        }, {
            $set: { 'aJsnMotivo.$.blnStatus': false }
        })
        .populate('aJsnMotivo')
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
                msg: 'Error: Error al eliminar el motivo.',
                cont: {
                    err: err.message
                }
            });

        });
});


module.exports = app;