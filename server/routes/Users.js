const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const User = require('../models/Users'); //subir nivel
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios')
const app = express();
const mailer = require('../libraries/mails');
const jwt = require('jsonwebtoken');
const async = require('async'); //23
const crypto = require('crypto'); //23

//|-----------------Api GET Listado Usuarios ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que retorna un listado de usuarios                   |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/obtener            |
//|----------------------------------------------------------|
//Obtiene todos los susuarios 

app.get('/obtener', [verificaToken], (req, res) => {

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

//|-----------------Api GET Listado Usuario Id --------------|
//| Creada por: Leticia Moreno                               |
//| Api que retorna un listado de usuario por id             |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/obtener/idUser     |
//|----------------------------------------------------------|
//Obtener un usuario por id 

app.get('/obtener/:id', [verificaToken], (req, res) => {
    let id = req.params.id;
    User.find({ _id: id })
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar el usuario',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente el usuario',
                cont: users.length,
                cnt: users
            });
        });
});

//|-----------------Api POST de Usuarios     ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que registra un usuario                              |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/registrar          |
//|----------------------------------------------------------|
//Crear un nuevo usuario con token y checando si tiene permiso 

app.post('/registrar', [verificaToken], async(req, res) => {

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
    await User.findOne({ 'strEmail': req.body.strEmail }).then(async(encontrado) => {
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
        mailOptions = {
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

//|-----------------Api POST de Usuarios     ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que registra un usuario sin token                    |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/registrar          |
//|----------------------------------------------------------|
//Registrar sin token 

app.post('/registro', async(req, res) => {

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
    await User.findOne({ 'strEmail': req.body.strEmail }).then(async(encontrado) => {
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

//|-----------------Api PUT de Usuarios      ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que actualiza un usuario                             |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/actualizar/idUser  |
//|----------------------------------------------------------|
app.put('/actualizar/:idUser', [verificaToken], (req, res) => {
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

//|-----------------Api DELETE de Usuarios   ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que elimina un usuario                               |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/eliminar/idUser    |
//|----------------------------------------------------------|
app.delete('/eliminar/:idUser', [verificaToken], (req, res) => {
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

//|-----------------Api POST de Usuarios     ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que logea un usuario                                 |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/login              |
//|----------------------------------------------------------|
app.post('/login', (req, res) => {
    let body = req.body;

    User.findOne({ strEmail: body.strEmail }, (err, usrDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Algo salio mal',
                err
            });
        }

        if (!usrDB) {
            return res.status(400).json({
                ok: false,
                status: 400,
                err: {
                    message: 'Usuario y/o contraseña incorrecta'
                }
            });
        }

        if (!bcrypt.compareSync(body.strPassword, usrDB.strPassword)) {
            return res.status(400).json({
                ok: false,
                status: 400,
                err: {
                    message: 'Usuario y/o *contraseña incorrecta'
                }
            });
        }

        let token = jwt.sign({
            user: usrDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        return res.status(200).json({
            ok: true,
            user: usrDB,
            token
        });
    });
});



////////////////////////////////////////////////////////////////////////////////////////////////

// API DE ENVIO DEL CORREO PARA RECUPERAR CONTRASEÑA 

///////////////////////////////////////////////////////////////////////////////////////////////

app.get('/forgot/:strEmail',  (req, res) => {

    const strEmail = req.params.strEmail;
    caducidadToken = '1hr';
    strUrl = 'http://localhost:4200/#/reset-password';

    if (!strEmail) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'No se recibió un correo válido',
            cont: {
                strCorreo
            }
        });
    }

    User.findOne({ strEmail }, { _id: 1, strName: 1, strLastName: 1 }).then(async(user) => {

        //console.log(user.strName);

        if (!user) {
            return res.status(404).json({
                ok: false,
                resp: 404,
                msg: 'No se encontró ningún usuario que coincida con el correo electrónico proporcionado',
                cont: {
                    strEmail
                }
            });
        }

        token = await jwt.sign({
            function(error, token) {
                if (error) {
                    return res.status(500).json({

                        ok: false,
                        resp: 500,
                        msg: error
                    });
                }
            },
            idUser: user._id,
        }, process.env.SEED, {
            expiresIn: caducidadToken
        });

        //Es un Json
        jsnEmail = {
            strName: user.strName + ' ' + user.strLastName,
            strEmail,
            strUrl: `${strUrl}/${token}`,
            subject: 'Recuperar Contraseña',
            nmbEmail: 4
        };
        await mailer.sendEmail(jsnEmail);

        return res.status(200).json({
            ok: true,
            status: 200,
            resp: 'Verificar tu correo electrónico.',
            cont: {

            }
        });

    }).catch((err) => {

        //console.log(err);
        return res.status(404).json({
            ok: false,
            resp: 404,
            msg: 'El correo electrónico proporcionado, no existe',
            cont: {
                error: Object.keys(err).length === 0 ? err.message : err
            }
        })
    })
});

/////////////////////////////////////////////////////////////////////////////////////////

// API DE RECUPERAR CONTRASEÑA 

////////////////////////////////////////////////////////////////////////////////////////
app.put('/reset-password/:token',  async(req, res) => {
    const token = req.params.token;
    let idUser = '';

    passwords = {
        first: req.body.strFPass,
        second: req.body.strSPass,
    };

    console.log(passwords.first);

    if (!passwords.first || !passwords.second) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'No se recibió la contraseña correctamente',
            cont: {
                recibido: false
            }
        });
    }

    if ((passwords.first.length != passwords.second.length) ||
        passwords.first != passwords.second) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'Las contraseñas no coinciden.',
            cont: {
                coincidencia: false
            }
        });
    }

    await jwt.verify(token, process.env.SEED, (err, dec) => { // Decodifica el token

        if (err) {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error al decodificar el token.',
                cont: {
                    error: Object.keys(err).length === 0 ? err.message : err
                }
            });
        }

        console.log(dec);
        if (dec) {
            idUser = dec.idUser ? dec.idUser : '';
        }
    });

    User.findByIdAndUpdate(idUser, { strPassword: bcrypt.hashSync(passwords.first, 10) }).then(async(user) => { //Aqui

        console.log(user);

        if (!user) {
            return res.status(404).json({
                ok: false,
                resp: 404,
                msg: 'No se encontró la persona',
                cont: {
                    user
                }
            });
        }

        jsnEmail = {
            strName: user.strName + ' ' + user.strLastName,
            strEmail: user.strEmail,
            strPassword: passwords.first,
            subject: 'Cambio de contraseña',
            nmbEmail: 5
        }
        await mailer.sendEmail(jsnEmail);

        return res.status(200).json({
            ok: true,
            resp: 200,
            msg: 'La contraseña se ha actualizado exitosamente.',
            cont: {
                user: {
                    strName: user.strName,
                    strLastName: user.strLastName,
                    strMotherLastName: user.strMotherLastName,
                    strEmail: user.strEmail
                }
            }
        });

    }).catch((err) => {

        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error al intentar buscar a la persona',
            cont: {
                error: Object.keys(err).length === 0 ? err.message : err
            }
        });

    });
})

module.exports = app;