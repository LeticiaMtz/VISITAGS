const express = require('express');
const mongoose = require('mongoose');
const _ = require('underscore');
const Modalidad = require('../models/modalidad');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

//|----------------- Api GET de Modalidad -----------------------|
//| Creada por: Martin Palacios                                  |
//| Api que obtiene los tipos de modalidad                       |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/modalidad/obtener            |
//|--------------------------------------------------------------|
app.get('/obtener', (req, res) => {
    Modalidad.find()
    .exec((err, modalidad) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        console.log(req.modalidad);
        return res.status(200).json({
            ok: true,
            count: modalidad.length,
            modalidad
        });
    });
});

//|----------------- Api GET by id de Modalidad -----------------|
//| Creada por: Martin Palacios                                  |
//| Api que obtiene un tipos de modalidad especifico mediante    |
//| un ID                                                        |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/modalidad/obtener/id         |
//|--------------------------------------------------------------|
app.get('/obtener/:id', (req, res) => {
    let id = req.params.id;
    Modalidad.find({ _id: id })
        .exec((err, modalidad) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar la modalidad',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se ha consultado correctamente la modalidad',
                cont: modalidad.length,
                cnt: modalidad
            });
        });
});

//|----------------- Api POST de Modalidad-- --------------------|
//| Creada por: Martin Palacios                                  |
//| Api que registra tipos de modalidad                          |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/modalidad/registrar          |
//|--------------------------------------------------------------|
app.post('/registrar', async (req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let modalidad = new Modalidad({
        strModalidad: body.strModalidad,
        blnStatus: body.blnStatus
    });
    

    Modalidad.findOne({ 'strModalidad': body.strModalidad }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'La modalidad ya ha sido registrada',

            });
        }
        modalidad.save((err, modalidad) => {
            if(err){
                return res.status(400).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Modalidad registrada correctamente",
                cont: {
                    modalidad
                }
            });
        });
    });
});

//|-------------------Api PUT de Modalidad----------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que actualiza el tipo de modalidad                            |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/modalidad/actualizar/idModalidad  |
//|-------------------------------------------------------------------|
app.put('/actualizar/:idModalidad', (req, res) => {
    let id = req.params.idModalidad;
    let numParam  = Object.keys(req.body).length;

    let modalidadBody;
    if(numParam == 2) modalidadBody =  _.pick(req.body,['strModalidad', 'blnStatus']);
    if(numParam == 1) modalidadBody =  _.pick(req.body,['blnStatus']);
        
    Modalidad.find({_id: id}).then((resp) => {
        if(resp.length > 0){
            Modalidad.findByIdAndUpdate(id, modalidadBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Modalidad actualizada exitosamente',
                    cont: resp.length,
                    cnt: resp
                });
            }).catch((err) =>{
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar la modalidad',
                    err: err
                });
            });
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar la modalidad',
            err: err
        });
    });
});

//|-------------------Api PUT de Modalidad----------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que elimina (desactiva) el tipo de modalidad                  |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/modalidad/eliminar/idModalidad    |
//|-------------------------------------------------------------------|
app.delete('/eliminar/:idModalidad',  (req, res) => {
    let id = req.params.idModalidad;

    Modalidad.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la modalidad',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la modalidad',
            cnt: resp
        });
    });
});

module.exports = app;
