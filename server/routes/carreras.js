const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Carrera = require('../models/carreras');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const {} = require('../middlewares/autenticacion');
const app = express();

//|-----------------     Api GET de carreras             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de carreras                               |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/obtener                     |
//|----------------------------------------------------------------------|
//Obtiene todos las carreras
app.get('/obtener', (req, res) => {

    Carrera.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, carrera) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las carreras',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carreras consultadas exitosamente',
                cont: carrera.length,
                cnt: carrera
            });
        });
});


//|-----------------     Api GET de carreras             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de carreras  segun id                     |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/obtener/id                     |
//|----------------------------------------------------------------------|
//Obtener una carrera por id 
app.get('/obtener/:id', [], (req, res) => {
    let id = req.params.id;
    Carrera.find({ _id: id })
        .exec((err, carrera) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carrera consultada exitosamente',
                cont: carrera.length,
                cnt: carrera
            });
        });
});




//|------------------------------------     Api POST de carreras            ----------------------------|
//| Creada por: Leticia Moreno                                                                          |
//| Api que registra una carrera                                                                        |
//| modificada por: Isabel Castillo                                                                     |
//| Fecha de modificacion:   1) 11-08-2020                                                              |
//|                          2) 03-09-2020                                                              |
//| cambios: 1) Se modifico el estatus 200 por un 400 en un mensaje de error                            |
//|          2) Se agrego una validación para que la primera letra de la primera palabra sea mayúscula  |
//| Ruta: http://localhost:3000/api/carreras/registrar                                                  |
//|-----------------------------------------------------------------------------------------------------|

// app.post('/registrar', [], async(req, res) => {
//     let body = req.body;
//     let carrera = new Carrera({
//         strCarrera: body.strCarrera,
//         blnStatus: body.blnStatus, 
//         aJsn

//     });


//     Carrera.findOne({ 'strCarrera': body.strCarrera }).then((encontrado) => {
//         if (encontrado) {
//             return res.status(400).json({
//                 ok: false,
//                 status: 400,
//                 msg: 'La carrera ya ha sido registrada',
//                 cnt: encontrado

//             });
//         }
//         carrera.save((err, carrera) => {
//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     status: 400,
//                     msg: 'Error al registrar la carrera',
//                     err: err
//                 });
//             }
//             return res.status(200).json({
//                 ok: true,
//                 status: 200,
//                 msg: "Carrera registrada exitosamente",
//                 cont: carrera.length,
//                 cnt: carrera
//             });
//         });
//     });

// });

app.post('/registrar', (req, res) => {
    let body = req.body;

    let strCarrera = '';
    let carrer = body.strCarrera.toLowerCase();
    for (let i = 0; i < carrer.length; i++) {
        if (i == 0) {
            strCarrera += carrer[i].charAt(0).toUpperCase();
        } else {
            strCarrera += carrer[i];
        }
    }

    let carrera = new Carrera({
        strCarrera: strCarrera
    });
    Carrera.findOne({ 'strCarrera': strCarrera }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'La carrera ya ha sido registrada',
                cnt: encontrado

            });
        }
        new Carrera(carrera).save((err, carDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al registrar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Se ha registrado correctamente la carrera',
                cont: carDB.length,
                cnt: {
                    carDB
                }
            });

        });
    });
});


//|-----------------     Api PUT de carreras             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una carrera                                        |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/actualizar/idCarrera        |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idCarrera', [], (req, res) => {
    let id = req.params.idCarrera;
    let numParam = Object.keys(req.body).length;

    let careerBody;
    if (numParam == 7) {
        careerBody = _.pick(req.body, ['strCarrera', 'blnStatus']);
    }
    if (numParam == 2) {
        careerBody = _.pick(req.body, ['blnStatus']);
    }
    if (numParam !== 7 && numParam !== 2) {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar la carrera',
            err: 'El número de parametros enviados no concuerdan con los que requiere la API'
        });
    }

    Carrera.findOne({ _id: { $ne: [id] }, strCarrera: { $regex: `^${careerBody.strCarrera}$`, $options: 'i' } }).then((resp) => {

        console.log(resp);
        if (resp) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: `La carrera ${careerBody.strCarrera} ya existe `,
                err: resp
            });
        }
        Carrera.findByIdAndUpdate(id, careerBody).then((resp) => {
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carrera actualizada exitosamente',
                cont: resp.length,
                cnt: resp
            });
        }).catch((err) => {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar la carrera',
                err: err
            });
        });
        //}
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar',
            err: err
        });
    });


});

// app.put('/actualizar/:idCarrera', [], (req, res) => {
//     let id = req.params.idCarrera;
//     const carreraBody = _.pick(req.body, ['strCarrera', 'blnStatus']);
//     Carrera.find({ _id: id }).then((resp) => {
//         if (resp.length > 0) {
//             Carrera.findByIdAndUpdate(id, carreraBody).then((resp) => {
//                 return res.status(200).json({
//                     ok: true,
//                     status: 200,
//                     msg: 'Carrera actualizada exitosamente',
//                     cont: resp.length,
//                     cnt: resp
//                 });
//             }).catch((err) => {
//                 return res.status(400).json({
//                     ok: false,
//                     status: 400,
//                     msg: 'Error al actualizar la carrera',
//                     err: err
//                 });
//             });
//         }
//     }).catch((err) => {
//         return res.status(400).json({
//             ok: false,
//             status: 400,
//             msg: 'Error al actualizar',
//             err: err
//         });
//     });
// });




//----------------------------------------  Carreras Obetener ----------------------------------->

app.get('/obtenerCarreras', (req, res) => {

    Carrera.find().populate([{ path: 'aJsnEspecialidad._id', select: 'strEspecialidad' }]) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, carrera) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las carreras',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carreras consultadas exitosamente',
                cont: carrera.length,
                cnt: carrera
            });
        });
});




//|-----------------     Api DELETE de carreras          ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una carrera                                          |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/eliminar/idCarrera          |
//|----------------------------------------------------------------------|
// app.delete('/eliminar/:idCarrera', [], (req, res) => {
//     let id = req.params.id;

//     Carrera.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 status: 400,
//                 msg: 'Ha ocurrido un error al eliminar la carrera',
//                 cnt: err
//             });
//         }
//         return res.status(200).json({
//             ok: true,
//             status: 200,
//             msg: 'Se ha eliminado correctamente la carrera',
//             cnt: resp
//         });
//     });
// });
app.delete('/eliminar/:idCarrera', (req, res) => {
    let id = req.params.idCarrera;

    Carrera.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la carrera',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la carrera',
            cont: resp.length,
            cnt: resp
        });
    });
});

module.exports = app;