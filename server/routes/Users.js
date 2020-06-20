const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const User = require('../models/Users'); //subir nivel
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios')
const app = express();
const mailer = require('../libraries/mails');

//Obtiene todos los susuarios 
app.get('/obtener', [verificaToken, rolMenuUsuario], (req, res) => {

    User.find({ blnStatus: true }) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, users) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            console.log(req.user);
            return res.status(200).json({
                ok: true,
                count: users.length,
                users
            });
        });
});
//Obtener un usuario por id 
app.get('/obtener/:idUser', [verificaToken, rolMenuUsuario], (req, res) => {
    User.findById(req.params.id)
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al buscar el usuario',
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Usuario encontrado',
                users
            });
        });
});

//Crear un nuevo usuario con token y checando si tiene permiso 
app.post('/registrar', [verificaToken, rolMenuUsuario], async (req, res) => {

    let body = req.body;
    let pass = req.body.strPassword;

    //para poder mandar los datos a la coleccion
    let user = new User({
        strName: req.body.strName,
        strLastName: req.body.strLastName,
        strMotherLastName: req.body.strMotherLastName,
        strEmail: req.body.strEmail,
        strPassword: bcrypt.hashSync(body.strPassword, 10),
        idRole: req.body.idRole,
        blnStatus: req.body.blnStatus

    });

    // validar el correo que ya existe
    await User.findOne({ 'strEmail': req.body.strEmail }).then(async (encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'El correo ya ha sido registrado',
                cont: {
                    user
                }

            });
        }

        await new User(user).save();
        //Create access token
        let mailOptions = {
            from: 'notificaciones@utags.edu.mx',
            to: user.strEmail,
            subject: 'Esta es tu contraseña en caso de no recordarla...',
            html: '<h1>¡Gracias por formar parte de Alertas académicas!</h1><br>' +
                '<h3>Hola ' + user.strName + ' </h3>' + '<h3>Tu contraseña es: </h3>' +
                pass,
        };

        mailer.sendMail(mailOptions);

        return res.status(200).json({
            ok: true,
            status: 200,
            msg: "Usuario registrado correctamente",
            cont: {
                user
            }
        });

    }).catch((err) => {
        console.log(err);
        return res.status(500).json({
            ok: false,
            resp: 500,
            const: {
                err: err.message
            }
        });
    });

});

//Registrar sin token 

app.post('/registro', async (req, res) => {

    let body = req.body;
    let pass = req.body.strPassword;

    //para poder mandar los datos a la coleccion
    let user = new User({
        strName: req.body.strName,
        strLastName: req.body.strLastName,
        strMotherLastName: req.body.strMotherLastName,
        strEmail: req.body.strEmail,
        strPassword: bcrypt.hashSync(body.strPassword, 10),
        idRole: req.body.idRole,
        blnStatus: req.body.blnStatus

    });

    // validar el correo que ya existe
    await User.findOne({ 'strEmail': req.body.strEmail }).then(async (encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'El correo ya ha sido registrado',
                cont: {
                    user
                }

            });
        }

        await new User(user).save();
        //Create access token
        let mailOptions = {
            from: 'notificaciones@utags.edu.mx',
            to: user.strEmail,
            subject: 'Esta es tu contraseña en caso de no recordarla...',
            html: '<h1>¡Gracias por formar parte de Alertas académicas!</h1><br>' +
                '<h3>Hola ' + user.strName + ' </h3>' + '<h3>Tu contraseña es: </h3>' +
                pass,
        };

        mailer.sendMail(mailOptions);

        return res.status(200).json({
            ok: true,
            status: 200,
            msg: "Usuario registrado correctamente",
            cont: {
                user
            }
        });

    }).catch((err) => {
        console.log(err);
        return res.status(500).json({
            ok: false,
            resp: 500,
            const: {
                err: err.message
            }
        });
    });

});

app.put('/actualizar/:idUser', [verificaToken, rolMenuUsuario], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['srtName', 'strLastName', 'strMotherLastName', 'strEmail', 'strPasswor', 'idRole', 'blnStatus']); //FILTRAR del body, on el pick seleccionar los campos que interesan del body 
    //id 'su coleccion, new -> si no existe lo inserta, runVali-> sirve para validar todas las condiciones del modelo 
    User.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usrDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        return res.status(200).json({
            ok: true,
            usrDB
        });

    });
});

app.delete('/eliminar/:idUser', [verificaToken, rolMenuUsuario], (req, res) => {
    let id = req.params.id;

    User.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al eliminar el usuario',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Usuario eliminado correctamente',
            resp
        });
    });
});

module.exports = app;