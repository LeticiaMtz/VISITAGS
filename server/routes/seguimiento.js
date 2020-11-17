/* jshint esversion: 8 */
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Alerts = require("../models/Alerts");
const User = require("../models/Users");
const fileUpload = require('../libraries/subirArchivo(1)');
const { isArray } = require("underscore");
const mailer = require("../libraries/mails");
const seguimiento = require("../models/seguimiento");
const jwt = require('jsonwebtoken');

//|-----------------          Api POST de alertas        ----------------|
//| Creada por: Miguel Salazar                                           |
//| Api que registra el segumiento a una alerta                          |
//| modificada por:                                                      |
//| Fecha de modificacion: 02/10/2020                                    |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/segumiento/                          |
//|----------------------------------------------------------------------|
app.post('/', process.middlewares, async(req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!req.query.idAlerta) throw 'Favor de ingresar el id de la alerta';
        if (!req.body.idUser) throw 'Favor de loguarse al sistema para poder comentar esta alerta';
        if (!req.body.strComentario) throw 'Favor de ingresar un comentario';
        if (!req.body.idEstatus) throw 'Favor de ingresar un estatus';

        let arrInvitados = req.body.arrInvitados ? req.body.arrInvitados.split(',') : []; // lista de invitados separado por comas
        let aJsnEvidencias = []; //Aqui se almacenan los archivos, su nomre y ruta

        if (req.files && isArray(req.files.strFileEvidencia)) { //Se cargan los archivos si existen
            for (let file of req.files.strFileEvidencia) {
                let strFileName = await fileUpload.subirArchivo(file, 'evidencias');
                aJsnEvidencias.push({
                    strNombre: strFileName,
                    strFileEvidencia: `/envidencias/${strFileName}`,
                    blnActivo: true
                });
            }
        } else if (req.files) {
            let strFileName = await fileUpload.subirArchivo(req.files.strFileEvidencia, 'evidencias');
            aJsnEvidencias.push({
                strNombre: strFileName,
                strFileEvidencia: `/envidencias/${strFileName}`,
                blnActivo: true
            });
        }

        let jsonSeguimiento = []; //array del seguimiento del que comenta y de sus invitados        

        if (arrInvitados.length > 0) {
            arrInvitados.forEach(usr => {
                if (req.body.idUser !== usr) {
                    jsonSeguimiento.push({
                        createdAt: new Date(),
                        idUser: usr,
                        idEstatus: req.body.idEstatus,
                        strComentario: '<b><i><i class="fa fa-user-plus" aria-hidden="true"></i>"Se ha unido para colaborar en esta alerta"</i></b>',
                    });
                }
            });
        }

        jsonSeguimiento.push({
            createdAt: new Date(),
            idUser: req.body.idUser,
            idEstatus: req.body.idEstatus,
            strComentario: req.body.strComentario,
            aJsnEvidencias
        });

        let alerta; //aqui se almacenan los datos de la alerta de la base de datos
        let arrIdPersonasCorreos = []; //Aqui guardamos todos los id de persona
        let listaCorreos = []; //aqui guardamos los nombre y correos de los implicados 

        const transactionResults = await session.withTransaction(async() => {
            let seguimientos = await Alerts.aggregate([{
                    $unwind: '$aJsnSeguimiento'
                },
                {
                    $match: {
                        '_id': mongoose.Types.ObjectId(req.query.idAlerta)
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: '$aJsnSeguimiento'
                    }
                }
            ]).session(session);

            let indicesRepetidos = [];

            if (seguimientos.length > 0) {
                seguimientos.forEach(seg => {
                    jsonSeguimiento.forEach(function(seguimiento, i) {
                        if (seg.idUser == seguimiento.idUser && seg.strComentario == seguimiento.strComentario) {
                            indicesRepetidos.push(i);
                        }
                    });
                });
                for (var i = indicesRepetidos.length - 1; i >= 0; i--) jsonSeguimiento.splice(indicesRepetidos[i], 1);
            }

            alerta = await Alerts.findOneAndUpdate({ _id: req.query.idAlerta }, { $set: { idEstatus: req.body.idEstatus }, $push: { aJsnSeguimiento: jsonSeguimiento } }, { upsert: true, new: true, session: session });
            await alerta.arrInvitados.forEach(usr => { //Esta funcion elimina los invitados que ya estaban en la BD
                arrInvitados = arrInvitados.filter((usr) => !alerta.arrInvitados.includes(usr));
            });

            alerta = await Alerts.findOneAndUpdate({ _id: req.query.idAlerta }, { $push: { arrInvitados: arrInvitados } }, { upsert: true, new: true, session: session });
            arrIdPersonasCorreos = alerta.arrInvitados;
            await arrIdPersonasCorreos.push(alerta.idUser);

            let aux = await User.find({ arrEspecialidadPermiso: { $in: alerta.idEspecialidad } }).session(session);
            aux.forEach(usr => {
                arrIdPersonasCorreos.push(usr._id);
            });
            arrIdPersonasCorreos = await arrIdPersonasCorreos.filter(function(item, pos) {
                return arrIdPersonasCorreos.indexOf(item) == pos;
            });

            let aux2 = await User.find({ _id: { $in: arrIdPersonasCorreos } }).session(session);
            aux2.forEach(usr => {
                listaCorreos.push(usr.strEmail);
            });
        });

        let url = `${process.env.URL_FRONT}/obtener-url`;
        let ruta = `/Tracking-alerts/${req.query.idAlerta}`;

        let token = jwt.sign({
            url: ruta
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


        if (transactionResults) {
            let emailBody = {
                nmbEmail: 9,
                strEmail: listaCorreos.join(','),
                subject: 'Alguien comento una alerta',
                strLink: `${url}/${token}`,
                html: `<h1>Una alerta ha sido comentada</h1><br><p>Por favor revisa el siguiente link para poder darle atención:</p><br>`
            };

            await mailer.sendEmail(emailBody, (err) => {
                if (err) console.log(err.message);
            });

            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: "Se ha creado el seguimiento exitosamente.",
                cont: {
                    alerta,
                },
            });
        } else {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "No se ha podido crear el seguimiento.",
                cont: {
                    error: "La transacción no se completó satisfactoriamente",
                },
            });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error al intentar registrar el comentario.",
                cont: {
                    error: `Se ha encontrado un valor duplicado: (${Object.keys(
            error.keyValue
          )}:${Object.values(error.keyValue)})`,
                },
            });
        } else {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error al intentar registrar el comentario..",
                cont: {
                    error: Object.keys(error).length === 0 ? error.message : error
                },
            });
        }
    } finally {
        session.endSession();
    }

});

//|-----------------          Api GET de Seguimiento     ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de seguimientos registrados en una alerta |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/seguimiento/obtener/:idAlert         |
//|----------------------------------------------------------------------|
app.get("/obtener/:idAlert", process.middlewares, (req, res) => {
    let idAlert = req.params.idAlert;
    Alerts.findById(idAlert, { aJsnSeguimiento: 1 })
        .populate([{
            path: "aJsnSeguimiento.idUser",
            select: "strName idRole strLastName strMotherLastName",
            populate: { path: "idRole", select: "strRole" },
        }, ])
        .sort({ created_at: "desc" })
        .exec((err, seguimiento) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: "Error al encontrar el seguimiento de la alerta ",
                    cnt: err,
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Success: Informacion obtenida correctamente.",
                cont: seguimiento.length,
                cnt: seguimiento,
            });
        });
});




module.exports = app;