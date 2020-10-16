/* jshint esversion: 8 */
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Seguimiento = require("../models/seguimiento");
const Evidencias = require("../models/evidencias");
const Alerts = require("../models/Alerts");
const User = require("../models/Users");
const { verificaToken } = require("../middlewares/autenticacion");
const cargarImagenes = require("../libraries/cargaImagenes");
const fileUpload = require('../libraries/subirArchivo(1)');
const { isArray } = require("underscore");
const rutaImg = "seguimiento";
const mailer = require("../libraries/mails");
const seguimiento = require("../models/seguimiento");
const jwt = require('jsonwebtoken');


const estatusNuevo = '5f186c5de9475240bc59e4a7';
const estatusEnProgreso = '5f186c7ee9475240bc59e4a9';

//|-----------------          Api POST de alertas        ----------------|
//| Creada por: Miguel Salazar                                           |
//| Api que registra el segumiento a una alerta                          |
//| modificada por:                                                      |
//| Fecha de modificacion: 02/10/2020                                    |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/segumiento/                          |
//|----------------------------------------------------------------------|
app.post('/', [], async(req, res) => {
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
                if (req.body.idUser !== usr) {
                    jsonSeguimiento.push({
                        idUser: usr,
                        idEstatus: req.body.idEstatus,
                        strComentario: '<b><i><i class="fa fa-user-plus" aria-hidden="true"></i>"Se ha unido a la alerta"</i></b>',
                    });
                }
            });
        }

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

            seguimientos.forEach(seg => {
                jsonSeguimiento.forEach(function(seguimiento, i) {
                    if (seg.idUser == seguimiento.idUser && seg.strComentario == seguimiento.strComentario) {
                        indicesRepetidos.push(i);
                    }
                });
            });
            for (var i = indicesRepetidos.length - 1; i >= 0; i--) jsonSeguimiento.splice(indicesRepetidos[i], 1);

            alerta = await Alerts.findOneAndUpdate({ _id: req.query.idAlerta }, { $push: { aJsnSeguimiento: jsonSeguimiento } }, { upsert: true, new: true, session: session });
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
                if (process.log) { console.log('[Enviando Correo]'); }
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
            console.log("La transacción fue abortada.");
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


//|-----------------          Api POST de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una api                                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/registrar                        |
//|----------------------------------------------------------------------|
app.post("/registrar/:idAlert", [], async(req, res) => {
    let idAlert = req.params.idAlert;

    let urlSeg = `http://localhost:4200/#/Tracking-alerts/${idAlert}`;

    if (process.log) {
        console.log(" params ", req.params);
        console.log(" body ", req.body);
    }
    const seguimiento = new Seguimiento(req.body);

    let personas = await Alerts.aggregate()
        .match({ _id: mongoose.Types.ObjectId(req.params.idAlert) })
        .unwind("aJsnSeguimiento")
        .replaceRoot("aJsnSeguimiento")
        .project({ idUser: 1 })
        .lookup({
            from: "users",
            localField: "idUser",
            foreignField: "_id",
            as: "data",
        });

    let arrIdPersonas = [];
    for (const persona of personas)
        if (persona.data[0]) arrIdPersonas.push(persona.data[0]._id);

    let pers = await User.find({ _id: { $in: arrIdPersonas } }, { _id: 1, strEmail: 1, strName: 1 });

    for (const persona of pers) {
        console.log(persona);
        let strCorreo = persona.strEmail;
        let strNombrePersona = persona.strName;
        mailOptions = {
            nmbEmail: 9,
            strEmail: strCorreo,
            strComentario: seguimiento.strComentario,
            strPersona: strNombrePersona,
            urlSeg: urlSeg,
            subject: "¡Nuevo Seguimiento!",
            html: "<h1>¡Por favor, revisa el nuevo seguimiento de alertas!</h1><br>" +
                `<h2>Esta es la liga del seguimiento: ${urlSeg}</h2>`,
        };

        mailer.sendEmail(mailOptions);
    }

    let err = seguimiento.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: "Error: Error al registrar la evidencia",
            cont: {
                err,
            },
        });
    }
    if (!req.files && !req.body.strFileEvidencia) {
        Alerts.findOneAndUpdate({
                _id: req.params.idAlert,
            }, {
                $push: {
                    aJsnSeguimiento: seguimiento,
                },
            })
            .then((seguimiento) => {
                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: "Success: Informacion insertada correctamente.",
                    cont: seguimiento.length,
                    cnt: {
                        seguimiento,
                    },
                });
            })
            .catch((err) => {
                return res.status(500).json({
                    ok: false,
                    resp: 500,
                    msg: "Error: Error al registrar la evidencia",
                    cont: {
                        err: err.message,
                    },
                });
            });
    }

    if (req.files || req.body.strFileEvidencia) {
        let aJsnEvidencias = [];
        let nombreImg;
        let arrFiles = req.files ?
            req.files.strFileEvidencia :
            req.body.strFileEvidencia;
        console.log(isArray(arrFiles, "ArrFiles"));
        if (isArray(arrFiles)) {
            for (const archivo of arrFiles) {
                await cargarImagenes
                    .subirImagen(archivo, rutaImg)
                    .then((fileName) => {
                        nombreImg = fileName;
                        aJsnEvidencias.push(nombreImg);
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.status(400).json({
                            ok: false,
                            resp: 400,
                            msg: "Error al procesar el archivo",
                            cont: {
                                err: err.message,
                            },
                        });
                    });
            }
        } else {
            await cargarImagenes
                .subirImagen(arrFiles, rutaImg)
                .then((fileName) => {
                    nombreImg = fileName;
                    aJsnEvidencias.push(nombreImg);
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(400).json({
                        ok: false,
                        resp: 400,
                        msg: "Error al procesar el archivo",
                        cont: {
                            err: err.message,
                        },
                    });
                });
        }

        for (let x = 0; x < aJsnEvidencias.length; x++) {
            const evidencias = new Evidencias({
                strNombre: aJsnEvidencias[x],
                strFileEvidencia: aJsnEvidencias[x],
                blnStatus: req.body.blnStatus,
            });
            seguimiento.aJsnEvidencias.push(evidencias);
        }
        Alerts.findOneAndUpdate({
                _id: req.params.idAlert,
            }, {
                $push: {
                    aJsnSeguimiento: seguimiento,
                },
            })
            .then((seguimiento) => {
                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: "Success: Informacion insertada correctamente.",
                    cont: seguimiento.length,
                    cnt: {
                        seguimiento,
                    },
                });
            })
            .catch((err) => {
                return res.status(500).json({
                    ok: false,
                    resp: 500,
                    msg: "Error: Error al registrar la evidencia",
                    cont: {
                        err: err.message,
                    },
                });
            });
    }
    if (
        (err) => {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error: Error interno",
                cont: {
                    err: err.message,
                },
            });
        }
    );
});

//|-----------------          Api POST de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una api                                             |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/registrar                        |
//|----------------------------------------------------------------------|
app.post("/registrar/:idAlert/:idSeguimiento", [verificaToken], (req, res) => {
    if (process.log) {
        console.log(" params ", req.params);
        console.log(" body ", req.body);
    }
    const evidencias = new Evidencias(req.body);

    console.log(evidencias);

    let err = evidencias.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: "Error: Error al registrar el seguimiento",
            cont: {
                err,
            },
        });
    }
    Alerts.findOneAndUpdate({
            _id: req.params.idAlert,
            "aJsnSeguimiento._id": req.params.idSeguimiento,
        }, {
            $push: {
                "aJsnSeguimiento.$.aJsnEvidencias": evidencias,
            },
        })
        .then((alert) => {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: "Success: Informacion insertada correctamente.",
                cont: evidencias.length,
                cnt: {
                    evidencias,
                },
            });
        })
        .catch((err) => {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error: Error al registrar el motivo",
                cont: {
                    err: err.message,
                },
            });
        });
});
if (
    (err) => {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: "Error: Error interno",
            cont: {
                err: err.message,
            },
        });
    }
);

//|-----------------          Api GET de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de apis registradas                       |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/obtener                          |
//|----------------------------------------------------------------------|
app.get("/obtener/:idAlert", [], (req, res) => {
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

//|-----------------          Api PUT de api             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una api                                            |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/actualizar/idCategoria/idApi     |
//|----------------------------------------------------------------------|
app.put("/actualizar/:idAlert/:idSeguimiento", [verificaToken], (req, res) => {
    if (process.log) {
        console.log(" params ", req.params);
        console.log(" body ", req.body);
    }
    let seguimiento = new Seguimiento({
        _id: req.params.idSeguimiento,
        idUser: req.body.idUser,
        idEstatus: req.body.idEstatus,
        strComentario: req.body.strComentario,
        aJsnEvidencias: req.body.aJsnEvidencias,
        blnStatus: req.body.blnStatus,
    });

    let err = seguimiento.validateSync();

    if (err) {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: "Error: Error al actualizar la api",
            cont: {
                err,
            },
        });
    }

    Alerts.aggregate(
        [{
                $unwind: "$aJsnSeguimiento",
            },
            {
                $match: {
                    "aJsnSeguimiento.blnStatus": true,
                    "aJsnSeguimineto.idUser": req.body.idUser,
                    "aJsnSeguimiento.idEstatus": req.body.idEstatus,
                    "aJsnSeguimiento.strComentario": req.body.strComentario,
                    "aJsnSeguimiento.aJsnEvidencias": req.body.aJsnEvidencias,
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$aJsnSeguimiento",
                },
            },
        ],
        (err, resp) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    resp: 500,
                    msg: "Error: Error del servidor",
                    cont: {
                        err,
                    },
                });
            }

            if (resp.length > 0) {
                if (req.params.idSeguimiento != resp[0]._id) {
                    return res.status(400).json({
                        ok: false,
                        resp: 400,
                        msg: "Error: El seguimeinto ya se encuentra registrada",
                        cont: {
                            resp,
                        },
                    });
                }
            }

            Alerts.findOneAndUpdate({
                    _id: req.params.idAlert,
                    "aJsnSeguimiento._id": req.params.idSeguimiento,
                }, {
                    $set: {
                        "aJsnSeguimineto.idUser": seguimiento.idUser,
                        "aJsnSeguimiento.idEstatus": seguimiento.idEstatus,
                        "aJsnSeguimiento.strComentario": seguimiento.strComentario,
                        "aJsnSeguimiento.aJsnEvidencias": seguimiento.aJsnEvidencias,
                        "aJsnSeguimiento.blnStatus": seguimiento.blnStatus,
                    },
                })
                .then((ruta) => {
                    return res.status(200).json({
                        ok: true,
                        resp: 200,
                        msg: "Success: Informacion actualizada correctamente.",
                        cont: {
                            ruta,
                        },
                    });
                })
                .catch((err) => {
                    return res.status(500).json({
                        ok: false,
                        resp: 500,
                        msg: "Error: Error al modificar la evidencia",
                        cont: {
                            err,
                        },
                    });
                });
        }
    );
});

//|-----------------          Api DELETE de api          ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una api                                              |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/eliminar/idCategoria/idApi       |
//|----------------------------------------------------------------------|
app.delete("/eliminar/:idAlert/:idSeguimeinto", [verificaToken], (req, res) => {
    if (process.log) {
        console.log(" params ", req.params);
        console.log(" body ", req.body);
    }
    Alerts.findOneAndUpdate({
            _id: req.params.idAlert,
            "aJsnSeguimiento._id": req.params.idSeguimiento,
        }, {
            $set: { "aJsnSeguimiento.$.blnStatus": false },
        })
        .populate("aJsnSeguimiento")
        .then((resp) => {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: "Success: Informacion eliminada correctamente.",
                cont: resp.length,
                cnt: {
                    resp,
                },
            });
        })
        .catch((err) => {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error: Error al eliminar la api.",
                cont: {
                    err: err.message,
                },
            });
        });
});

//|-----------------          Api GET de api            ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de apis registradas                       |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/api/obtener                          |
//|----------------------------------------------------------------------|
app.get("/obtenerA/:idAlert", [], (req, res) => {
    let idAlert = req.params.idAlert;
    if (process.log) {
        console.log(" params ", req.params);
    }
    Alerts.findById(idAlert, { aJsnSeguimiento: 1 })
        .populate({ path: "aJsnSeguimiento.idEstatus", select: "strNombre" })
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