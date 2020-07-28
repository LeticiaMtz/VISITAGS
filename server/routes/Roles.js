const express = require('express');
const _ = require('underscore');
const Role = require('../models/Roles'); //subir nivel
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios')

//|-----------------  Api GET de Roles       ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que obtine listado de roles                          |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/roles/obtener            |
//|----------------------------------------------------------|
app.get('/obtener', [verificaToken], (req, res) => {
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
                cont: roles.length,
                cnt: roles
            });
        });
});

//|-----------------   Api GET de Roles      ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que obtine un rol por id                             |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/roles/obtener/idRole     |
//|----------------------------------------------------------|
//Obtener por id
app.get('/obtener/:id',  (req, res) => {
    let id = req.params.id;
    Role.find({ _id: id })
        .exec((err, roles) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar el rol',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente el role',
                cont: roles.length,
                cnt: roles
            });
        });
});

//|-----------------    Api POST de Roles    ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que registra un role                                 |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/roles/registrar          |
//|----------------------------------------------------------|
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
            cont: rolDB.length, 
            cnt: rolDB
        });
    });
});


//|-----------------    Api PUT de Roles     ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que actualiza un role                                |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/roles/actualizar/idRole  |
//|----------------------------------------------------------|
app.put('/actualizar/:idRole', [verificaToken], (req, res) => {
    let id = req.params.idRole;
    console.log(req.params.idRole)
    const roleBody = _.pick(req.body, ['strRole', 'strDescripcion', 'blnStatus', 'arrApi']);
    Role.find({ _id: id }).then((resp) => {
        if (resp.length > 0) {
            Role.findByIdAndUpdate(id, roleBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    status: 200, 
                    msg: 'Rol actualizado con éxito',
                    cont: resp.length,
                    cnt: resp
                });
            }).catch((err) => {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al actualizar el rol',
                    err: err
                });
            });
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400, 
            msg: 'Error al actualizar el rol',
            err: err
        });
    });
});

//|-----------------    Api DELETE de Roles  ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que registra un role                                 |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/roles/eliminar/idRole          |
//|----------------------------------------------------------|
app.delete('/eliminar/:idRole', [verificaToken], (req, res) => {
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
            status: 200, 
            msg: 'Rol eliminado correctamente',
            cont: resp.length, 
            cnt: resp
        });
    });
});

module.exports = app;