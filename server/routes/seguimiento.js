/* jshint esversion: 8 */
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Alerts = require("../models/Alerts");
const fileUpload = require('../libraries/subirArchivo(1)');
const { isArray } = require("underscore");
const estatusNuevo = '5f186c5de9475240bc59e4a7';

//|-----------------          Api POST de alertas        ----------------|
//| Creada por: Miguel Salazar                                           |
//| Api que registra el segumiento a una alerta                          |
//| modificada por:                                                      |
//| Fecha de modificacion: 01/01/2020                                    |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts                               |
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
        jsonSeguimiento.push({
            idUser: req.body.idUser,
            idEstatus: req.body.idEstatus,
            strComentario: req.body.strComentario,
            aJsnEvidencias
        });

        if (arrInvitados.length > 0) {
            arrInvitados.forEach(usr => {
                jsonSeguimiento.push({
                    idUser: usr,
                    idEstatus: estatusNuevo,
                    strComentario: '<b><i><i class="fa fa-user-plus" aria-hidden="true"></i>"Se ha unido a la alerta"</i></b>',
                });
            });
        }

        let alerta;

        const transactionResults = await session.withTransaction(async() => {
            alerta = await Alerts.findOneAndUpdate({ _id: req.query.idAlerta }, { $set: { aJsnSeguimiento: jsonSeguimiento } }, { upsert: true, new: true, session: session });
            await alerta.arrInvitados.forEach(usr => {
                arrInvitados.push(usr.toString());
            });
            alerta = await Alerts.findOneAndUpdate({ _id: req.query.idAlerta }, { $set: { arrInvitados: arrInvitados } }, { upsert: true, new: true, session: session });
        });

        if (transactionResults) {
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
                msg: "Error al intentar registrar la alerta",
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
                msg: "Error al intentar registrar la alerta.",
                cont: {
                    error: Object.keys(error).length === 0 ? error.message : error,
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
app.get("/obtener/:idAlert", process.middlewares,  (req, res) => {
    let idAlert = req.params.idAlert;
    if (process.log) {
        console.log(" params ", req.params);
    }
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
                    msg: "Error al encontrar el seguimeinto de la alerta ",
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