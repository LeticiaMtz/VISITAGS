const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const Estatus = require('../models/Estatus'); //subir nivel
const app = express();



//|-----------------Api GET Listado Estatus------------------|
//| Creada por: Abraham Carranza                             |
//| Fecha: 7/07/2020                                         |
//| Api que retorna un listado de estatus                    |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/estatus/obtener          |
//|----------------------------------------------------------|

app.get('/obtener', (req, res) => {
    Estatus.find().exec((err, estatus) => { //ejecuta la funcion
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'error al generar la lista',
                resp: err
            });
        }
        console.log(req.estatus);
        return res.status(200).json({
            ok: true,
            msg: 'Lista generada exiosamente',
            count: estatus.length,
            resp: estatus
        });
    });
});

app.get('/obtener/:id', (req, res) => {
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


//|--------------------Api POST de Estatus-------------------|
//| Creada por: Abraham Carranza                             |
//| Fecha: 7/07/2020                                         |
//| Api que registra un estatus                              |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/estatus/registrar        |
//|----------------------------------------------------------|

app.post('/registrar', async(req, res) => {
    let body = req.body;

    let estatus = new Estatus({
        strNombre: body.strNombre,
        strDescripcion: body.strDescripcion,
        blnActivo: body.blnActivo,
    });

    Estatus.findOne({ 'strNombre': body.strNombre }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'El nombre del estatus ya ha sido registrado',
            });
        }

        estatus.save((err, estatus) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    resp: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Categoria del estatus fué registrado correctamente",
                cont: {
                    resp: estatus
                }
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
    console.log(req.params.idEstatus);
    const estatusBody = _.pick(req.body, ['strNombre', 'blnActivo', 'strDescripcion']);

    Estatus.find({ _id: id }).then((resp) => {

        if (resp.length > 0) {
            Estatus.findByIdAndUpdate(id, estatusBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Actualizado con éxito',
                    cont: resp.length,
                    cnt: resp
                });
            }).catch((err) => {
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
    let id = req.params.id;

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
            cnt: resp
        });

    });
});

module.exports = app;