const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const {} = require('../middlewares/autenticacion');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const Estatus = require('../models/Estatus'); //subir nivel
const app = express();
const mongoose = require('mongoose');

const idCoordinador = '5eeee0db16952756482d186a';

//|-----------------Api GET Listado Estatus------------------|
//| Creada por: Abraham Carranza                             |
//| Fecha: 7/07/2020                                         |
//| Api que retorna un listado de estatus                    |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/estatus/obtener          |
//|----------------------------------------------------------|

app.get('/obtener', [], (req, res) => {
    Estatus.find().exec((err, estatus) => { //ejecuta la funcion
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 200,
                msg: 'Error al generar la lista',
                cnt: err
            });
        }
        console.log(req.estatus);
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Lista generada exiosamente',
            cont: estatus.length,
            cnt: estatus
        });
    });
});

app.get('/obtener/:id', [], (req, res) => {
    let id = req.params.id;

    Estatus.find({ _id: id }).exec((err, estatus) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ocurrio un error al consultar los estatus',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se han consultado correctamente los estatus',
            cont: estatus.length,
            cnt: estatus
        });
    });
});

//|-----------------Api GET Listado Estatus------------------|
//| Creada por: Martin Palacios                              |
//| Fecha: 01/09/2020                                        |
//| Api que retorna un listado de estatus dependiendo del rol|
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/estatus/obtenerE          |
//|----------------------------------------------------------|

app.get('/obtenerEstatus/:idRol', [], (req, res) => {

    if (idCoordinador == req.params.idRol) {
        Estatus.find({ strNombre: { $nin: 'Nueva' } }).exec((err, estatus) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 200,
                    msg: 'Error al generar la lista',
                    cnt: err
                });
            }
            console.log(req.estatus);
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista generada exiosamente',
                cont: estatus.length,
                cnt: estatus
            });
        });
    } else {
        Estatus.find({ strNombre: { $nin: ['Nueva', 'Finalizado'] } }).exec((err, estatus) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 200,
                    msg: 'Error al generar la lista',
                    cnt: err
                });
            }
            console.log(req.estatus);
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista generada exiosamente',
                cont: estatus.length,
                cnt: estatus
            });
        });
    }
});

//|--------------------Api POST de Estatus----------------------------------------------------------|
//| Creada por: Abraham Carranza                                                                    |
//| Fecha: 7/07/2020                                                                                |
//| Api que registra un estatus                                                                     |
//| modificada por:  Isabel Castillo                                                                |
//| Fecha de modificacion: 02/09/20                                                                 |
//| cambios: Se agrego una validación para que la primera letra de la primera palabra sea mayúscula |
//| Ruta: http://localhost:3000/api/estatus/registrar                                               |
//|-------------------------------------------------------------------------------------------------|


app.post('/registrar', [], async(req, res) => {
    let body = req.body;

    let estatus = new Estatus({
        strNombre: body.strNombre,
        strDescripcion: body.strDescripcion,
        blnActivo: body.blnActivo,
    });

    Estatus.findOne({ _id: { $ne: [mongoose.Types.ObjectId(req.params.idEstatus)] }, strNombre: { $regex: `^${estatus.strNombre}$`, $options: 'i' } }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'El nombre del estatus ya ha sido registrado',
                cnt: encontrado
            });
        }

        estatus.save((err, estatus) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'El estatus ya ha sido registrado',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Categoria del estatus fué registrado correctamente",
                cont: estatus.length,
                cnt: estatus
            });
        });
    });

});


//|--------------------Api PUT de Estatus--------------------|
//| Creada por: Abraham Carranza                             |
//| Fecha: 7/07/2020                                         |
//| Api que actualiza un estatus                             |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/estatus/actualizar/:id   |
//|----------------------------------------------------------|
app.put('/actualizar/:idEstatus', (req, res) => {
    let id = req.params.idEstatus;
    let numParam = Object.keys(req.body).length;

    let estatusBody;
    if (numParam == 7) {
        estatusBody = _.pick(req.body, ['strNombre', 'strDescripcion', 'blnActivo']);
    }
    if (numParam == 1) {
        estatusBody = _.pick(req.body, ['blnActivo']);
    }
    if (numParam !== 7 && numParam !== 1) {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar el estatus',
            err: 'El número de parametros enviados no concuerdan con los que requiere la API'
        });
    }

    Estatus.findOne({ _id: { $ne: [id] }, strNombre: { $regex: `^${estatusBody.strNombre}$`, $options: 'i' } }).then((resp) => {

        console.log(resp);
        if (resp) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: `El estatus ${estatusBody.strNombre} ya existe `,
                err: resp
            });
        }
        
        Estatus.findByIdAndUpdate(id, estatusBody).then((resp) => {
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Estatus actualizado exitosamente',
                cont: resp.length,
            });
        }).catch((err) => {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar el estatus',
                cnt: err
            });
        });
    }).catch((err) => {

        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar',
            err: err
        });

    });

});

//|------------------Api DELETE de Estatus-------------------|
//| Creada por: Abraham Carranza                             |
//| Fecha: 7/07/2020                                         |
//| Api que elimina un estatus                               |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/estatus/eliminar/:id     |
//|----------------------------------------------------------|

app.delete('/eliminar/:idEstatus', (req, res) => {
    let id = req.params.idEstatus;

    Estatus.findByIdAndUpdate(id, { blnActivo: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar el estatus',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente el estatus',
            cont: resp.length,
            cnt: resp
        });
    });
});

module.exports = app;