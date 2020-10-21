require('./../config/config');
const express = require('express');
const db = require("mongoose");
const moment = require("moment");
const _ = require('underscore');
const Alert = require('../models/Alerts'); //subir nivel
const Carrera = require('../models/carreras');
const app = express();
const fileUpload = require('../libraries/subirArchivo(1)');
const User = require('../models/Users');
const { select, isArray, forEach, each } = require('underscore');
const email = require('../libraries/mails');
const Crde = require('../models/crde');
//ID de los usaurios con los diferentes roles existentes 
const idProfesor = '5eeee0db16952756482d1868';
const idDirector = '5eeee0db16952756482d1869';
const idCoordinador = '5eeee0db16952756482d186a';
const idAdministrador = "5f1e2419ad1ebd0b08edab74";
const estatusNuevo = '5f186c5de9475240bc59e4a7';

//|-----------------          Api GET de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de las alertas registradas                |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/obtener                       |
//|----------------------------------------------------------------------|
app.get('/obtener', process.middlewares, (req, res) => {
    Alert.find({ blnStatus: true }) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, alerts) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al generar la lista',
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista de alertas generada exitosamente',
                cont: alerts.length,
                cnt: alerts
            });
        });
});

//|-----------------          Api GET de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de las alertas registradas por id         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/obtener/idAlert               |
//|----------------------------------------------------------------------|
app.get('/obtener/:id', process.middlewares, (req, res) => {
    let id = req.params.id;
    Alert.find({ _id: id })
        .exec((err, alerts) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al encontrar la alerta ',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Alerta encontrada',
                cont: alerts.length,
                cnt: alerts
            });
        });
});

//|-----------------          Api POST de alertas        ----------------|
//| Creada por: Miguel Salazar                                           |
//| Api que registra una alerta                                          |
//| modificada por:                                                      |
//| Fecha de modificacion: 01/01/2020                                    |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts                               |
//|----------------------------------------------------------------------|
app.post('/', process.middlewares, async(req, res) => {
    const session = await db.startSession();
    try {
        //Se validan los campos minimos para insertar
        if (!req.body.idUser) throw "Favor de loguearse para poder crear una alerta";
        if (!req.body.idAsignatura) throw "Favor de proporcionar la asignatura";
        if (!req.body.idCarrera) throw "Favor de proporcionar la carrera";
        if (!req.body.idEspecialidad) throw "Favor de proporcionar la especialidad";
        if (!req.body.idModalidad) throw "Favor de proporcionar la modalidad";
        if (!req.body.strDescripcion) throw "Favor de proporcionar la descripción";
        if (!req.body.strGrupo) throw "Favor de proporcionar el grupo";
        if (!req.body.chrTurno) throw "Favor de proporcionar el turno";

        if (!req.body.arrCrde) throw "Favor de proporcionar motivos(s) de riesgo para generar la alerta";
        if (!req.body.strMatricula) throw "Favor de proporcionar matriculas(s) para generar la alerta";
        if (!req.body.strNombreAlumno) throw "Favor de proporcionar alumno(s) para generar la alerta";

        let arrMotivosRiesgo = req.body.arrCrde.split(',');
        let arrMatriculas = req.body.strMatricula.split(',');
        let arrNombreAlumnos = req.body.strNombreAlumno.split(',');
        let arrInvitados = req.body.arrInvitados && typeof req.body.arrInvitados !== 'undefined' && req.body.arrInvitados !== '' ? req.body.arrInvitados.split(',') : []; //Generamos array de invitados si es que existen
        let aJsnEvidencias = []; //Array de nombres de archivos

        if (req.files && isArray(req.files.strFileEvidencia)) { //Se cargan los archivos si existen
            for (let file of req.files.strFileEvidencia) {
                let strFileName = await fileUpload.subirArchivo(file, 'evidencias');
                aJsnEvidencias.push({
                    strNombre: strFileName,
                    strFileEvidencia: `/envidencias/${strFileName}`,
                    blnActivo: true
                });
            }
        } else if (req.files && !isArray(req.files.strFileEvidencia)) {
            let strFileName = await fileUpload.subirArchivo(req.files.strFileEvidencia, 'evidencias');
            aJsnEvidencias.push({
                strNombre: strFileName,
                strFileEvidencia: `/envidencias/${strFileName}`,
                blnActivo: true
            });
        }

        let alertas = []; //aqui se almacenan todas la alertas
        let aJsnSeguimiento = null; //Aqui se almacenan los invitados como comentarios de seguimiento

        if (arrInvitados.length > 0) { //Verificamos que realmente existen invitados
            var idUsuarioCreador = arrInvitados.indexOf(req.body.idUser); //Busca la pocision del id del creador de la alerta
            idUsuarioCreador !== -1 ? arrInvitados.splice(idUsuarioCreador, 1) : //elimina al creador del array de invitados
                arrInvitados = await arrInvitados.filter(function(item, pos) { //Aqui nos aseguramos que no se repitan los invitados en caso de que el front los envie repetidos
                    return arrInvitados.indexOf(item) == pos;
                });
            let invitados = () => { //Esta es una función que conforma el subdocumento de seguimiento para agregar invitados
                let datos = [];
                for (let i = 0; i < arrInvitados.length; i++) {
                    datos.push({
                        idUser: arrInvitados[i],
                        idEstatus: estatusNuevo,
                        strComentario: '<b><i><i class="fa fa-user-plus" aria-hidden="true"></i>"Se ha unido para colaborar en esta alerta"</i></b>'
                    });
                }
                return datos;
            };

            aJsnSeguimiento = invitados();
        }

        for (let i = 0; i < arrMatriculas.length; i++) {
            alertas.push({
                idUser: req.body.idUser,
                idEstatus: estatusNuevo,
                strMatricula: arrMatriculas[i],
                strNombreAlumno: arrNombreAlumnos[i],
                idAsignatura: req.body.idAsignatura,
                idCarrera: req.body.idCarrera,
                idEspecialidad: req.body.idEspecialidad,
                strGrupo: req.body.strGrupo,
                chrTurno: req.body.chrTurno,
                idModalidad: req.body.idModalidad,
                strDescripcion: req.body.strDescripcion,
                arrCrde: arrMotivosRiesgo,
                arrInvitados: arrInvitados,
                aJsnEvidencias: aJsnEvidencias
            });
            if (aJsnSeguimiento !== null) alertas[i].aJsnSeguimiento = aJsnSeguimiento;
        }

        let listaDeCorreos = []; //Variable que guarda la lista de correos tanto para invitado como para usuarios con el rol de esa especialidad
        let listaAlertas = null; //Aqui se guardaran las alertas generadas

        const transactionResults = await session.withTransaction(async() => {
            listaAlertas = await Alert.insertMany(alertas, { session: session });

            let usuarios = await User.find({ arrEspecialidadPermiso: { $in: [req.body.idEspecialidad] } }).session(session);
            usuarios.forEach(usr => {
                listaDeCorreos.push(usr.strEmail);
            });

            let invitados = await User.find({ _id: { $in: arrInvitados } }).session(session);
            invitados.forEach(usr => {
                listaDeCorreos.push(usr.strEmail);
            });

            listaDeCorreos = await listaDeCorreos.filter(function(item, pos) {
                return listaDeCorreos.indexOf(item) == pos;
            });
        });

        if (transactionResults) {
            let emailBody = {
                nmbEmail: 10,
                strEmail: listaDeCorreos.join(','),
                subject: 'Nueva Alerta Academica',
                strLink: process.env.URL_FRONT,
                html: ''
            };

            let result = await email.sendEmail(emailBody, (err) => {
                if (process.log) { console.log('[Enviando Correo]'); }
                if (err) console.log(err);
            });

            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: "La alerta se ha creado exitosamente.",
                cont: {
                    listaAlertas,
                },
            });
        } else {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "No se ha podido crear la alerta.",
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
                msg: "Error al intentar registrar la alerta.",
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
                msg: "Error al intentar registrar la alerta..",
                cont: {
                    error: Object.keys(error).length === 0 ? error.message : error,
                },
            });
        }
    } finally {
        session.endSession();
    }
});

//|------------------- Api GET de alertas por usuario -------------------|
//| Creada por: Abraham Carranza                                         |
//| Api que obtiene alertas dependiendo del rol del usuario              |
//| modificada por: Abraham Carranza                                     |
//| Fecha de modificacion:  9 de Septiembre del 2020                     |
//| cambios: Se cambio la respuesta para que obtenga los motivos de los  |
//|          crde y no el crde                                           |
//| Ruta: http://localhost:3000/api/alerts/obtenerAlertas/idRol/idUser   |
//|----------------------------------------------------------------------|
app.get('/obtenerAlertas/:idRol/:idUser', process.middlewares, async(req, res) => {
    let idRol = req.params.idRol;
    let idUser = req.params.idUser;
    let body = req.body;


    if (idRol == idProfesor) {
        Alert.find({ $or: [{ idUser: idUser }, { arrInvitados: { $in: [idUser] } }] }).sort({ updatedAt: 'desc' }).limit(8).populate([{ path: 'idEstatus', select: 'strNombre' }, { path: 'idCarrera', select: 'strCarrera' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }]).then(async(resp) => {
            let alertas = resp.map(alert => alert.toObject());
            const motivos = await Crde.aggregate().unwind('aJsnMotivo').replaceRoot('aJsnMotivo');

            for (const alerta of alertas) {
                for (const index of alerta.arrCrde.keys()) {
                    let crde = motivos.find(motivo => motivo._id.toString() === alerta.arrCrde[index].toString());
                    if (crde) alerta.arrCrde[index] = crde;
                }
            }

            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente las alertas',
                cont: alertas.length,
                cnt: alertas
            });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ocurrio un error al consultar las alertas',
                cnt: err
            });
        });
    } else if (idRol == idAdministrador) {

        Alert.find({ $or: [{ idUser: idUser }, { arrInvitados: { $in: [idUser] } }] }).sort({ updatedAt: 'desc' }).limit(8).populate([{ path: 'idEstatus', select: 'strNombre' }, { path: 'idCarrera', select: 'strCarrera' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }])
            .then(async(resp) => {

                let alertas = resp.map(alert => alert.toObject());
                const motivos = await Crde.aggregate().unwind('aJsnMotivo').replaceRoot('aJsnMotivo');

                for (const alerta of alertas) {
                    for (const index of alerta.arrCrde.keys()) {
                        let crde = motivos.find(motivo => motivo._id.toString() === alerta.arrCrde[index].toString());
                        if (crde) alerta.arrCrde[index] = crde;
                    }
                }

                return res.status(200).json({
                    ok: true,
                    status: 200,
                    msg: 'Se han consultado correctamente',
                    cont: alertas.length,
                    cnt: alertas
                });

            }).catch((err) => {
                console.log(err);
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar el rol',
                    cnt: err
                });
            });
    } else if (idRol == idCoordinador || idRol == idDirector) {

        let usuario = await User.findById(idUser);

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ocurrio un error al consultar el rol',
                cnt: err
            });
        }

        let arrEspecialidad = usuario.arrEspecialidadPermiso;
        let arrAlertas = [];

        for (const idEspecialidad of arrEspecialidad) {
            await Alert.find({ $or: [{ idUser: idUser }, { idEspecialidad }, { arrInvitados: { $in: [idUser] } }] }).sort({ updatedAt: 'desc' }).limit(8).populate([{ path: 'idEstatus', select: 'strNombre' }, { path: 'idCarrera', select: 'strCarrera' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }]).then(async(alertas) => {
                for (const i of alertas) {
                    if (i.blnStatus != undefined) {
                        await arrAlertas.push(i);
                    }
                }
            })
        };

        let alertas = arrAlertas.map(alert => alert.toObject());
        const motivos = await Crde.aggregate().unwind('aJsnMotivo').replaceRoot('aJsnMotivo');

        for (const alerta of alertas) {
            for (const index of alerta.arrCrde.keys()) {
                let crde = motivos.find(motivo => motivo._id.toString() === alerta.arrCrde[index].toString());
                if (crde) alerta.arrCrde[index] = crde;
            }
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se han consultado correctamente',
            cont: alertas.length,
            cnt: alertas
        });
    };

});



//|------------------- Api GET de alertas por usuario -------------------|
//| Creada por: Martin Palacios                                          |
//| Api que obtiene una alerta mediante un id                            |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/obtenerAlerta/:idAlerta              |
//|----------------------------------------------------------------------|

app.get('/obtenerAlerta/:idAlerta', process.middlewares, async(req, res) => {
    let idAlert = req.params.idAlerta;

    Alert.find({ _id: idAlert }).populate([{ path: 'idUser' }, { path: 'idEstatus', select: 'strNombre' }, { path: 'idCarrera', select: 'strCarrera' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }, { path: 'idAsignatura', select: 'strAsignatura' }]).then(async(resp) => {

        let alertas = resp.map(alert => alert.toObject());
        const motivos = await Crde.aggregate().unwind('aJsnMotivo').replaceRoot('aJsnMotivo');

        for (const alerta of alertas) {
            for (const index of alerta.arrCrde.keys()) {
                let crde = motivos.find(motivo => motivo._id.toString() === alerta.arrCrde[index].toString());
                if (crde) alerta.arrCrde[index] = crde;
            }
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se han consultado correctamente la alerta',
            cont: alertas.length,
            cnt: alertas
        });
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Ocurrio un error al consultar la alerta',
            cnt: err
        });
    });
});


//|-----------------          Api GET de alertas         -----------------------------------------|
//| Creada por: Leticia Moreno                                                                    |
//| Api que hace el filtrado de alertas                                                           |
//| modificada por:                                                                               |
//| Fecha de modificacion:                                                                        |
//| cambios:                                                                                      |
//| Ruta: http://localhost:3000/api/alerts//obtenerAlertasMonitor                                 |
//| /:idCarrera/:idEspecialidad/:idUser/:idAsignatura/:idEstatus/:dteFechaInicio/:dteFechaFin     |
//|-----------------------------------------------------------------------------------------------|
app.get('/obtenerAlertasMonitor/:idCarrera/:idEspecialidad/:idUser/:idAsignatura/:idEstatus/:dteFechaInicio/:dteFechaFin', process.middlewares, (req, res) => {
    idCarrera = req.params.idCarrera;
    idEspecialidad = req.params.idEspecialidad;
    idUser = req.params.idUser;
    idAsignatura = req.params.idAsignatura;
    idEstatus = req.params.idEstatus;
    dteFechaInicio = req.params.dteFechaInicio;
    dteFechaFin = req.params.dteFechaFin;
    let query = {};
    if (idCarrera != 'undefined') {
        query.idCarrera = idCarrera;
    }
    if (idEspecialidad != 'undefined') {
        query.idEspecialidad = idEspecialidad;
    }
    if (idUser != 'undefined') {
        query.idUser = idUser;
    }
    if (idAsignatura != 'undefined') {
        query.idAsignatura = idAsignatura;
    }
    if (idEstatus != 'undefined') {
        query.idEstatus = idEstatus;
    }
    if (dteFechaInicio != 'undefined') {
        if (dteFechaFin != 'undefined') {
            query.createdAt = { "$gte": new Date(dteFechaInicio), "$lt": new Date(dteFechaFin).setDate(new Date(dteFechaFin).getDate() + 1) };
        } else {
            query.createdAt = { "$gte": new Date(dteFechaInicio) };
        }
    }
    if (dteFechaFin != 'undefined') {
        query.createdAt = { "$lt": new Date(dteFechaFin) };
    }
    if (!dteFechaInicio) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'No se recibió una fecha válida.',
            cont: {
                dteFechaInicio,
                // dteFechaFin
            }
        });
    }
    Alert.find(query)
        .populate([{
                path: 'idCarrera',
                select: 'strCarrera',
                populate: { path: 'aJsnEspecialidad', select: 'strEspecialidad' }
            },
            { path: 'idAsignatura', select: 'strAsignatura' },
            { path: 'idUser', select: 'strName strLastName strMotherLastName' },
            { path: 'idEstatus', select: 'strNombre' }
        ]).exec(async(err, alerts) => { //ejecuta la funcion
            let alertas = alerts.map(alert => alert.toObject());
            const motivos = await Crde.aggregate().unwind('aJsnMotivo').replaceRoot('aJsnMotivo');
            for (const alerta of alertas) {
                for (const index of alerta.arrCrde.keys()) {
                    let crde = motivos.find(motivo => motivo._id.toString() === alerta.arrCrde[index].toString());
                    if (crde) alerta.arrCrde[index] = crde;
                }
            }
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al generar la lista',
                    err
                });
            } else if (alertas.length == 0) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'No se encuentran registros en la base de datos',
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista de alertas generada exitosamente',
                cont: alertas.length,
                cnt: alertas
            });
        });
});

app.get('/reporteMonitor', process.middlewares, async(req, res) => {
    const session = await db.startSession();

    try {
        let filtros = {};

        if (!req.query.idCarrera || typeof req.query.idCarrera === 'undefined' || req.query.idCarrera === '') throw "Por favor seleccione una carrera";
        filtros.idCarrera = req.query.idCarrera;
        if (req.query.idEspecialidad && typeof req.query.idEspecialidad !== 'undefined' && req.query.idEspecialidad !== '') filtros.idEspecialidad = req.query.idEspecialidad;
        if (req.query.idAsignatura && typeof req.query.idAsignatura !== 'undefined' && req.query.idAsignatura !== '') filtros.idAsignatura = req.query.idAsignatura;
        // if (req.query.idProfesor && typeof req.query.idProfesor !== 'undefined' && req.query.idProfesor !== '') filtros.idProfesor = req.query.idProfesor;
        if (req.query.idEstatus && typeof req.query.idEstatus !== 'undefined' && req.query.idEstatus !== '') filtros.idEstatus = req.query.idEstatus;
        if (req.query.dteFechaInicio && typeof req.query.dteFechaInicio !== 'undefined' && req.query.dteFechaInicio !== '') {
            if (req.query.dteFechaFin && typeof req.query.dteFechaFin !== 'undefined' && req.query.dteFechaFin !== '') {
                filtros.createdAt = { "$gte": moment(req.query.dteFechaInicio).utcOffset(0).set({ hour: 0, minute: 0 }).toISOString(), "$lt": moment(req.query.dteFechaFin).utcOffset(0).set({ hour: 23, minute: 59 }).toISOString() };
            } else {
                filtros.createdAt = { "$gte": moment(req.query.dteFechaInicio).utcOffset(0).set({ hour: 0, minute: 0 }).toISOString() };
            }
        }
        let alertas = null;

        const transactionResults = await session.withTransaction(async() => {
            // let arrEspecialidadesUsuario = req.user.arrEspecialidadPermiso;

            // let carrerasUsuario = null;
            // if (filtros.idCarrera) {
            //     carrerasUsuario = await Carrera.findOne({
            //         _id: filtros.idCarrera,
            //         "aJsnEspecialidad._id": {
            //             $in: arrEspecialidadesUsuario
            //         }
            //     }).session(session);
            // }

            // if (carrerasUsuario === null) throw "Lo sentimos, no existe ninguna alerta creada por ti con esa carrera";
            // if (filtros.idEspecialidad && !arrEspecialidadesUsuario.includes(filtros.idEspecialidad)) throw "Lo sentimos, no existe ninguna alerta creada por ti con esa especialidad";

            console.log(filtros);
            alertas = await Alert.find({
                "$and": [{
                        "$or": [{
                                idUser: {
                                    "$in": [req.user._id]
                                }
                            },
                            {
                                arrInvitados: {
                                    "$in": [req.user._id]
                                }
                            }
                        ]
                    },
                    filtros
                ]
            }).session(session);
        });

        if (transactionResults) {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: "El reporte se ha consultado con exito.",
                cont: {
                    count: alertas.length,
                    alertas
                }
            });
        } else {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error al intentar obtener el reporte",
                cont: {
                    error: "La transacción no se completó satisfactoriamente",
                }
            });
        }

    } catch (error) {
        if (error.code === 11000) {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error al intentar obtener el reporte.",
                cont: {
                    error: `Se ha encontrado un valor duplicado: (${Object.keys(
                error.keyValue
              )}:${Object.values(error.keyValue)})`,
                }
            });
        } else {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: "Error al intentar obtener el reporte..",
                cont: {
                    error: Object.keys(error).length === 0 ? error.message : error,
                }
            });
        }
    } finally {
        session.endSession();
    }
});

module.exports = app;