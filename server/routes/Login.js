const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const mailer = require('../libraries/mails');
const app = express();

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

module.exports = app;