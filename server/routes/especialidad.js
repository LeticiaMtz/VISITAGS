/* jshint esversion: 8 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Especialidad = require('../models/especialidad');
const Carrera = require('../models/carreras');
const {} = require('../middlewares/autenticacion');

//|-----------------     Api POST de Especialidad        ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una especialidad                                    |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/especialidad/registrar/idCarrera     |
//|----------------------------------------------------------------------|
app.post('/registrar/:idCarrera', (req, res) => {

    const especialidad = new Especialidad(req.body);

    let err = especialidad.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error: Error al registrar la especialidad',
            cnt: {
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
                    cnt: {
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
                    .then((especialidad) => {
                        return res.status(200).json({
                            ok: true,
                            resp: 200,
                            msg: 'Success: Informacion insertada correctamente.',
                            cont: especialidad.length,
                            cnt: {
                                especialidad
                            }
                        });
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            ok: false,
                            resp: 500,
                            msg: 'Error: Error al registrar la especialidad',
                            cnt: {
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
                cnt: {
                    err: err.message
                }
            });
        });
});



//|-----------------     Api GET de Especialidad         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de las especialidades                        |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/especialidad/obtener/idCarrera       |
//|----------------------------------------------------------------------|
app.get('/obtener/:idCarrera', [], (req, res) => {
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
                    cont: rutas.length,
                    cnt: {
                        rutas
                    }
                });

            } else {

                return res.status(404).json({
                    ok: true,
                    resp: 404,
                    msg: 'Error: La carrera no existe o no cuenta con rutas de especialidad',
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
                msg: "Error: Error al obtener las especialidades de la carrera.",
                cnt: {
                    err: err.message
                }
            });

        });

});

// API DE PRUEBA 
// app.get('/obtener/:idCarrera'), [], (req, res) => {

//     idCarrera = req.params.idCarrera;

//     if (!idCarrera || idCarrera.length != 24){
//         return res.status(400).json({
//             ok: false,
//             resp: 400,
//             msg: 'La carrera no existe o no cuenta con rutas de especialidad',
//             cont: {
//                 idCarrera
//             }
//         });
//     }




// };

//|-----------------     Api PUT de Especialidad         ----------------------------|
//| Creada por: Leticia Moreno                                                       |
//| Api que actualiza una especialidad                                               |
//| modificada por:                                                                  |
//| Fecha de modificacion:                                                           |
//| cambios:                                                                         |
//| Ruta: http://localhost:3000/api/especialidad/actualizar/idCarrera/idEspecialidad |
//|----------------------------------------------------------------------------------|
app.put('/actualizar/:idCarrera/:idEspecialidad', [], (req, res) => {
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
            cnt: {
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
                cnt: {
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
                    cnt: {
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
                    msg: 'Error: Error al modificar la especialidad',
                    cnt: {
                        err
                    }
                });

            });
    });

});

//|-----------------     Api DELETE de Especialidad      --------------------------|
//| Creada por: Leticia Moreno                                                     |
//| Api que elimina una especialidad                                               |
//| modificada por:                                                                |
//| Fecha de modificacion:                                                         |
//| cambios:                                                                       |
//| Ruta: http://localhost:3000/api/especialidad/eliminar/idCarrera/idEspecialidad |
//|--------------------------------------------------------------------------------|
app.delete('/eliminar/:idCarrera/:idEspecialidad', [], (req, res) => {
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
                msg: 'Error: Error al eliminar la  especialidad.',
                cnt: {
                    err: err.message
                }
            });

        });
});


module.exports = app;