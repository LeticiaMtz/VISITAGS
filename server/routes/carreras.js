const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Carrera = require('../models/carreras');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
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
app.get('/obtener', [verificaToken], (req, res) => {

    Carrera.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, carrera) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            console.log(req.carrera);
            return res.status(200).json({
                ok: true,
                count: carrera.length,
                carrera
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
app.get('/obtener/:id', [verificaToken], (req, res) => {
    let id = req.params.id;
    Carrera.find({ _id: id })
        .exec((err, carrera) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente la carrera',
                cont: carrera.length,
                cnt: carrera
            });
        });
});




//|-----------------     Api POST de carreras            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una carrera                                         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/registrar                   |
//|----------------------------------------------------------------------|
app.post('/registrar', [verificaToken], async (req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let carrera = new Carrera({
        strCarrera: body.strCarrera,
        blnStatus: body.blnStatus, 
        aJsnEspecialidad: body.aJsnEspecialidad

    });
    

    Carrera.findOne({ 'strCarrera': body.strCarrera }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'La carrera ya ha sido registrada',

            });
        }
        carrera.save((err, carrera) => {
            if(err){
                return res.status(400).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Carrera registrado correctamente",
                cont: {
                    carrera
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
app.put('/actualizar/:idCarrera', [verificaToken], (req,res) => {
    let id = req.params.idCarrera;
    console.log(req.params.idCarrera)
    const carreraBody =  _.pick(req.body,['strCarrera','blnStatus']);
    Carrera.find({_id: id}).then((resp) => {
        if(resp.length > 0){
            Carrera.findByIdAndUpdate(id,carreraBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Actualizada carrera con éxito',
                    cont: resp.length,
                    cnt: resp
                });
            }).catch((err) =>{
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar',
                    err: err
                });
            });
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
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
app.delete('/eliminar/:idCarrera', [verificaToken],  (req, res) => {
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
            cnt: resp
        });
    });
});

module.exports = app;