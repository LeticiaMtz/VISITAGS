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




//|-----------------     Api POST de carreras            -------------------|
//| Creada por: Leticia Moreno                                              |
//| Api que registra una carrera                                            |
//| modificada por: Isabel Castillo                                         |
//| Fecha de modificacion:   11-08-2020                                     |
//| cambios: Se modifico el estatus 200 por un 400 en un mensaje de error   |
//| Ruta: http://localhost:3000/api/carreras/registrar                      |
//|-------------------------------------------------------------------------|
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
    let carrera = new Carrera({
        strCarrera: body.strCarrera
    });
    Carrera.findOne({ 'strCarrera': body.strCarrera }).then((encontrado) => {
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
    const carreraBody = _.pick(req.body, ['strCarrera', 'blnStatus']);
    Carrera.find({ _id: id }).then((resp) => {
        if (resp.length > 0) {
            Carrera.findByIdAndUpdate(id, carreraBody).then((resp) => {
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
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar',
            err: err
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
app.delete('/eliminar/:idCarrera', [], (req, res) => {
    let id = req.params.id;

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