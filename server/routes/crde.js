const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Crde = require('../models/crde');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
//|-----------------     Api GET de categoria crde       ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de categorias de crde                         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/obtener                         |
//|----------------------------------------------------------------------|
//Obtiene todos las categorias de crde
app.get('/obtener', [], (req, res) => {

    Crde.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, crde) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    msg: 'error al generar la lista',
                    cnt: err
                });
            }
            console.log(req.crde);
            return res.status(200).json({
                ok: true,
                status: 200, 
                msg: 'Lista generada exiosamente',
                count: crde.length,
                cnt: crde
            });
        });
});
//|-----------------     Api GET de categoria crde       ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de categorias de crde segun id                |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/obtener/id                      |
//|----------------------------------------------------------------------|
//Obtener una categoria de crde por id 
app.get('/obtener/:id', [verificaToken], (req, res) => {
    let id = req.params.id;
    Crde.find({ _id: id })
        .exec((err, crde) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar las categorias de crde',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente la categori crde',
                cont: crde.length,
                cnt: crde
            });
        });
});

//|-----------------     Api POST de categoria crde      ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una categoria de crde                               |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/registrar                       |
//|----------------------------------------------------------------------|
// Registrar una categoria de crde
app.post('/registrar', [verificaToken], async(req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let crde = new Crde({
        strCategoria: body.strCategoria,
        aJsnMotivo: body.aJsnMotivo,
        blnStatus: body.blnStatus,

    });


    Crde.findOne({ 'strCategoria': body.strCategoria }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'El nombre de la categoria ya ha sido registrada',
                cnt: err

            });
        }
        crde.save((err, crde) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    mg: 'No se pudo guardar la nueva categoria',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Categoria de crde registrada correctamente",
                cont: crde.length, 
                cnt: {
                    crde
                }
            });
        });
    });

});

//|-----------------     Api PUT de categoria crde       ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una categoria de crde                              |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/actualizar/idCrde               |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idCrde', [verificaToken], (req, res) => {
    let id = req.params.idCrde;
    console.log(req.params.idCrde)
    const crdeBody = _.pick(req.body, ['strCategoria', 'blnStatus']);
    Crde.find({ _id: id }).then((resp) => {
        if (resp.length > 0) {
            Crde.findByIdAndUpdate(id, crdeBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    status: 400, 
                    msg: 'Actualizada con éxito',
                    cont: resp.length,
                    cnt: resp
                });
            }).catch((err) => {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    msg: 'Error al actualizar',
                    cnt: err
                });
            });
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400, 
            msg: 'Error al actualizar',
            cnt: err
        });
    });
});

//|-----------------     Api DELETE de categoria crde    ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una categoria de crde                                |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/eliminar/idCrde                 |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idCrde', [verificaToken], (req, res) => {
    let id = req.params.id;

    Crde.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la categoria de crde',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la categoria crde',
            cont: resp.length, 
            cnt: resp
        });
    });
});

module.exports = app;