const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const Alert = require('../models/Alerts'); //subir nivel
const app = express();

//|-----------------          Api GET de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de las alertas registradas                |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/obtener                       |
//|----------------------------------------------------------------------|
app.get('/obtener', [verificaToken, rolMenuUsuario ], (req, res) => {
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
            console.log(req.alert);
            return res.status(200).json({
                ok: true,
                status: 200, 
                msg: 'Lista de alertas generada exitosamente',
                count: alerts.length,
                alerts
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
//Obtener por id
app.get('/obtener/:idAlert', [verificaToken, rolMenuUsuario ], (req, res) => {
    Alert.findById(req.params.id)
        .exec((err, alerts) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400, 
                    msg: 'Error al encontrar la alerta ',
                    err
                });
            }
            return res.status(200).json({
                ok: true, 
                status: 200, 
                msg: 'Alerta encontrada',
                alerts
            });
        });
});

//|-----------------          Api POST de alertas        ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una alerta                                          |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/registrar                     |
//|----------------------------------------------------------------------|
//Agregar nueva alerta
app.post('/registrar', [verificaToken], async (req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let alert = new Alert({
        idUser: body.idUser,
        idEstatus: body.idEstatus, 
        strMatricula: body.strMatricula, 
        strNombreAlumno: body.strNombreAlumno, 
        idAsigantura: body.idAsigantura, 
        idEspecialidad: body.idEspecialidad, 
        strGrupo: body.strGrupo, 
        chrTurno: body.chrTurno, 
        idModalidad: body.idModalidad, 
        strDescripcion: body.strDescripcion, 
        arrCrde: body.arrCrde, 
        aJsnEvidencias: body.aJsnEvidencias, 
        aJsnSeguimiento: body.aJsnSeguimiento, 
        blnStatus: body.blnStatus

    });
    
        alert.save((err, alert) => {
            if(err){
                return res.status(400).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Alerta registrada correctamente",
                cont: {
                    alert
                }
            });
        });
    });



//|-----------------          Api PUT de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una alerta                                         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/actualizar/idAlert            |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idAlert', [verificaToken], (req,res) => {
    let id = req.params.idAlert;
    console.log(req.params.idAlert)
    const alertBody =  _.pick(req.body,['idUser','idEstatus', 'strMatricula', 'strNombreAlumno', 'idAsigantura', 'idEspecialidad', 'strGrupo', 'chrTurno', 'idModalidad', 'strDescripcion', 'arrCrde', 'aJsnEvidencias', 'aJsnSeguimiento', 'blnStatus']);
    Alert.find({_id: id}).then((resp) => {
        if(resp.length > 0){
            Alert.findByIdAndUpdate(id,alertBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Actualizada con éxito',
                    cont: resp.length,
                    cnt: resp
                });
            }).catch((err) =>{
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar',
                    err: err
                });
            });
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar',
            err: err
        });
    });
});

//|-----------------          Api DELETE de alertas      ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una alerta                                           |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/eliminar/idAlert              |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idAlert', [verificaToken], (req, res) => {
    let id = req.params.id;

    //update from - set 
    Alert.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al eliminar alerta',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status:200, 
            msg: 'Alerta eliminada correctamente',
            resp
        });
    });
});

module.exports = app;