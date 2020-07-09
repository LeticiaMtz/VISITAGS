/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Motivo = require('../models/motivosCrde');
const Crde = require('../models/crde');


app.post('/registrar/:idCrde', (req, res) => {
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
            'aJsnMotivo.strNombre':  motivo.strNombre,
            // 'aJsnMotivo.strClave':  motivo.strClave,
            'aJsnMotivo.blnStatus': true
        })
        Crde.findOne({
            '_id': req.params.idCrde,
            'aJsnMotivo.strClave':  motivo.strClave,
            'aJsnMotivo.blnStatus': true
        })
        .populate('aJsnMotivo')
        .then((resp) => {
            if (resp) {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: `Error: El motivo " ${ motivo.strNombre} "y/o la clave ${motivo.strClave}" ya se encuentra registradas.`,
                    cont: {
                        resp
                    }
                });
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
                            cont: {
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


app.get('/obtener/:idCrde', (req, res) => {
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
                    cont: {
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

app.put('/actualizar/:idCrde/:idMotivo',  (req, res) => {
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
                    cont: {
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

app.delete('/eliminar/:idCrde/:idMotivo', (req, res) => {
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
                cont: {
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