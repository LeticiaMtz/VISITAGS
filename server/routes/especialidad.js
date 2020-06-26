/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Especialidad = require('../models/especialidad');
const Carrera = require('../models/carreras');


app.post('/registrar/:idCarrera', (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    const especialidad = new Especialidad(req.body);

    let err = especialidad.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al registrar la especialidad',
            cont: {
                err
            }
        });
    }

    Carrera.findOne({
            '_id': req.params.idCarrera,
            'aJsnEspecialidad.strEspecialidad': especialidad.strEspecialidad,
            'aJsnEspecialidad.blnStatus': true
        })
        .populate('aJsnEspecialidad')
        .then((resp) => {
            if (resp) {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: `Error: La especialidad " ${ especialidad.strEspecialidad } " ya se encuentra registrada.`,
                    cont: {
                        resp
                    }
                });
            } else {
                Carrera.findOneAndUpdate({
                        '_id': req.params.idCarrera
                    }, {
                        $push: {
                            aJsnEspecialidad: especialidad
                        }
                    })
                    .then((carrera) => {
                        return res.status(200).json({
                            ok: true,
                            resp: 200,
                            msg: 'Success: Informacion insertada correctamente.',
                            cont: {
                                especialidad
                            }
                        });
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            ok: false,
                            resp: 500,
                            msg: 'Error: Error al registrar la especialidad',
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


app.get('/obtener/:idCarrera', (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
    }
    Carrera.aggregate([{
                $unwind: '$aJsnEspecialidad'
            },
            {
                $match: {
                    '_id': mongoose.Types.ObjectId(req.params.idCarrera),
                    'blnStatus': true
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$aJsnEspecialidad'
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
                    msg: 'Error: La carrera no existe o no cuenta con rutas de especialidad',
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
                msg: "Error: Error al obtener las especialidades de la carrera.",
                cont: {
                    err: err.message
                }
            });

        });

});

app.put('/actualizar/:idCarrera/:idEspecialidad',  (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    let especialidad = new Especialidad({
        _id: req.params.idEspecialidad,
        strEspecialidad: req.body.strEspecialidad,
        blnStatus: req.body.blnStatus
    });

    let err = especialidad.validateSync();

    if (err) {

        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al actualizar la especialidad',
            cont: {
                err
            }
        });

    }

    Carrera.aggregate([{
            $unwind: '$aJsnEspecialidad'
        },
        {
            $match: {
                'aJsnEspecialidad.blnStatus': true,
                'aJsnEspecialidad.strEspecialidad': req.body.strEspecialidad
            }
        },
        {
            $replaceRoot: {
                newRoot: '$aJsnEspecialidad'
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
            if (req.params.idEspecialidad != resp[0]._id) {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: 'Error: La especialidad ya se encuentra registrada',
                    cont: {
                        resp
                    }
                });
            }
        }


        Carrera.findOneAndUpdate({
                '_id': req.params.idCarrera,
                'aJsnEspecialidad._id': req.params.idEspecialidad
            }, {
                $set: {
                    'aJsnEspecialidad.$.strEspecialidad': especialidad.strEspecialidad,
                    'aJsnEspecialidad.$.blnStatus': especialidad.blnStatus
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
                    msg: 'Error: Error al modificar la especialidad',
                    cont: {
                        err
                    }
                });

            });
    });

});

app.delete('/eliminar/:idCarrera/:idEspecialidad', (req, res) => {
    if (process.log) {
        console.log(' params ', req.params);
        console.log(' body ', req.body);
    }
    Carrera.findOneAndUpdate({
            '_id': req.params.idCarrera,
            'aJsnEspecialidad._id': req.params.idEspecialidad
        }, {
            $set: { 'aJsnEspecialidad.$.blnStatus': false }
        })
        .populate('aJsnEspecialidad')
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
                msg: 'Error: Error al eliminar la  especialidad.',
                cont: {
                    err: err.message
                }
            });

        });
});


module.exports = app;