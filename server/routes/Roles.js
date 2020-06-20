const express = require('express');
const _ = require('underscore');
const Role = require('../models/Roles'); //subir nivel
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios')

app.get('/obtener', [verificaToken, rolMenuUsuario ],  (req, res) => {

    Role.find({ blnStatus: true }) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, roles) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    msg: 'Error al generar la lista',
                    err
                });
            }
            console.log(req.role);
            return res.status(200).json({
                ok: true,
                status: 200, 
                msg: 'Lista de commentarios generada exitosamente',
                count: roles.length,
                roles
            });
        });
});

//Obtener por id
app.get('/obtener/:idRole', [verificaToken ], (req, res) => {
    Role.findById(req.params.id)
        .exec((err, roles) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    msg: 'Error al encontrar el rol',
                    err
                });
            }
            return res.status(200).json({
                ok: true, 
                status: 200, 
                msg: 'Rol encontrado',
                roles
            });
        });
});

//Agregar nueva alerta
app.post('/registrar', [verificaToken], (req, res) => {
    let body = req.body;
    let role = new Role({
        //para poder mandar los datos a la coleccion
        strRole: body.strRole,
        strDescripcion: body.strDescripcion,
        blnStatus: body.blnStatus,
        arrApi: body.arrApi,
      
    });

    role.save((err, rolDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al registrar rol',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200, 
            msg: 'Se registro el rol correctamente', 
            rolDB
        });
    });
});



app.put('/actualizar/:idRole', [verificaToken, rolMenuUsuario ], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['strRole', 'strDescripcion', 'blnStatus', 'arrApi']); //FILTRAR del body, on el pick seleccionar los campos que interesan del body 
    //id 'su coleccion, new -> si no existe lo inserta, runVali-> sirve para validar todas las condiciones del modelo 
    Role.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, rolDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al actualizar rol',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200, 
            msg: 'Rol actualizado correctamente',
            rolDB
        });

    });
});

app.delete('/eliminar/:idRole', [verificaToken, rolMenuUsuario ], (req, res) => {
    let id = req.params.id;

    //update from - set 
    Role.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al eliminar rol',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status:200, 
            msg: 'Rol eliminado correctamente',
            resp
        });
    });
});

module.exports = app;