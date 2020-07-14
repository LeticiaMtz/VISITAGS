const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const CategoriaApi = require('../models/CategoriaApi');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

//|-----------------     Api GET de categoriaApi         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de categorias api                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/categoiaApi/obtener                  |
//|----------------------------------------------------------------------|
app.get('/obtener', [verificaToken, rolMenuUsuario], (req, res) => {
    CategoriaApi.find()
        .exec((err, catApis) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las CategoriasApis',
                    cnt: err
                });
            }

            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'CategoriasApis consultadas correctamente',
                cont: catApis.length,
                cnt: catApis
            });
        });
});

//|-----------------     Api GET de categoriaApi         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de categorias api segun id                    |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/categoiaApi/obtener/idCategoria      |
//|----------------------------------------------------------------------|
app.get('/obtener/:idCategoria', [verificaToken, rolMenuUsuario], (req, res) => {
    let id = req.params.id;
    CategoriaApi.find({ _id: id })
        .exec((err, catApis) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar el CategoriaApi',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'CategoriaApi consultada correctamente',
                cont: catApis.length,
                cnt: catApis
            });
        });
});

//|-----------------     Api POST de categoriaApi        ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una categoria api                                   |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/categoiaApi/registrar                |
//|----------------------------------------------------------------------|
app.post('/registrar', [verificaToken], (req, res) => {
    let body = req.body;
    let categoriaApi = new CategoriaApi({
        strName: body.strName,
        strDescripcion: body.strDescripcion
    });
    new CategoriaApi(categoriaApi).save((err, catDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al registrar los datos generales',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            resp: 200,
            msg: 'Se ha registrado correctamente la categoriaApi',
            cont: {
                catDB
            }
        });

    });
});

//|-----------------     Api PUT de categoriaApi         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una categoria api                                  |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/categoiaApi/actualizar/idCategoria   |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idCategoria', [verificaToken, rolMenuUsuario], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['strName', 'strDescripcion']);
    CategoriaApi.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, catDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al actualizar el API',
                cnt: err
            });
        }

        return res.status(200).json({
            ok: true,
            resp: 200,
            msg: 'La respuesta se ha actualizado exitosamente.',
            cont: {
                categoriaApi
            }
        });
    });
});

//|-----------------     Api DELETE de categoriaApi      ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una categoria api                                    |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/categoiaApi/eliminar/idCategoria     |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idCategoria', [verificaToken, rolMenuUsuario],  (req, res) => {
    let id = req.params.id;

    CategoriaApi.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la CategoriaApi',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la CategoriaApi',
            cnt: resp
        });
    });
});

module.exports = app;