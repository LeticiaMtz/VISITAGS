const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const Estatus = require('../models/Estatus'); //subir nivel
const app = express();


app.get('/obtener', (req, res) => {

    Estatus.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, estatus) => { //ejecuta la funcion
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
//Obtener una categoria de crde por id 
app.get('/obtener/:id', (req, res) => {
    let id = req.params.id;
    Estatus.find({ _id: id })
        .exec((err, estatus) => {
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

// Registrar una categoria de crde
app.post('/registrar', async(req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
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

app.put('/actualizar/:idEstatus', (req, res) => {
    let id = req.params.idEstatus;
    console.log(req.params.idEstatus)
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