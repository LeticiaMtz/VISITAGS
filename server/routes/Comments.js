const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios')
const Comment = require('../models/Comments'); //subir nivel
const app = express();

app.get('/obtener', [verificaToken, rolMenuUsuario ], (req, res) => {

    Comment.find({ blnStatus: true }) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, comments) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    msg: 'Error al generar la lista',
                    err
                });
            }
            console.log(req.comment);
            return res.status(200).json({
                ok: true,
                status: 200, 
                msg: 'Lista de commentarios generada exitosamente',
                count: comments.length,
                comments
            });
        });
});

//Obtener por id
app.get('/obtener/:id', [verificaToken], (req, res) => {
    let id = req.params.id;
    Comment.find({ _id: id })
        .exec((err, comments) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar el comentario',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente el comentario',
                cont: comments.length,
                cnt: comments
            });
        });
});

//Agregar nueva alerta
app.post('/registrar', [verificaToken, rolMenuUsuario ], (req, res) => {
    let body = req.body;
    let comment = new Comment({
        //para poder mandar los datos a la coleccion
        strComment: body.strComment,
        strAlert: body.strAlert,
        blnStatus: body.blnStatus,
      
    });

    comment.save((err, comDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al registrar comentario',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200, 
            msg: 'Se registro el comentario correctamente', 
            comDB
        });
    });
});



app.put('/actualizar/:idComment', [verificaToken, rolMenuUsuario ], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['strComment', 'strAlert', 'blnStatus']); //FILTRAR del body, on el pick seleccionar los campos que interesan del body 
    //id 'su coleccion, new -> si no existe lo inserta, runVali-> sirve para validar todas las condiciones del modelo 
    Comment.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, comDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al actualizar comentario',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200, 
            msg: 'Comentario actualizado correctamente',
            comDB
        });

    });
});

app.delete('/eliminar/:idComment', [verificaToken, rolMenuUsuario ], (req, res) => {
    let id = req.params.id;

    //update from - set 
    Comment.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al eliminar comentario',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status:200, 
            msg: 'Comentario eliminado correctamente',
            resp
        });
    });
});

module.exports = app;