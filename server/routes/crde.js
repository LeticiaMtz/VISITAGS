const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Crde = require('../models/crde');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

//Obtiene todos las categorias de crde
app.get('/obtener', (req, res) => {

    Crde.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, crde) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'error al generar la lista',
                    err
                });
            }
            console.log(req.crde);
            return res.status(200).json({
                ok: true,
                msg: 'Lista generada exiosamente',
                count: crde.length,
                crde
            });
        });
});
//Obtener una categoria de crde por id 
app.get('/obtener/:id', (req, res) => {
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
// Registrar una categoria de crde
app.post('/registrar', async (req, res) => {
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
                resp: 400,
                msg: 'El nombre de la categoria ya ha sido registrada',

            });
        }
        crde.save((err, crde) => {
            if(err){
                return res.status(400).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Categoria de crde registrada correctamente",
                cont: {
                    crde
                }
            });
        });
    });

});

app.put('/actualizar/:idCrde', (req,res) => {
    let id = req.params.idCrde;
    console.log(req.params.idCrde)
    const crdeBody =  _.pick(req.body,['strCategoria','blnStatus']);
    Crde.find({_id: id}).then((resp) => {
        if(resp.length > 0){
            Crde.findByIdAndUpdate(id,crdeBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Actualizada con éxito',
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

app.delete('/eliminar/:idCrde',  (req, res) => {
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
            cnt: resp
        });
    });
});

module.exports = app;