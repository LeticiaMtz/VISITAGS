const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const Alert = require('../models/Alerts'); //subir nivel
const app = express();

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

//Agregar nueva alerta
app.post('/registrar', [verificaToken, rolMenuUsuario ], (req, res) => {
    let body = req.body;
    let alert = new Alert({
        //para poder mandar los datos a la coleccion
        strMatricula: body.strMatricula,
        strStudentName: body.strStudentName,
        strEducationalProgram: body.strEducationalProgram,
        strIncidence: body.strIncidence, 
        strTracing: body.strIncidence, 
        strUser: body.strUser
    });

    alert.save((err, aleDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al registrar el alerta',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200, 
            msg: 'Se registro la alerta correctamente', 
            aleDB
        });
    });
});



app.put('/actualizar/:idAlert', [verificaToken, rolMenuUsuario ], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['strMatricula', 'strStudentName', 'strEducationalProgram', 'strIncidence', 'strTracing', 'strUser', 'dteDate', 'blnStatus']); //FILTRAR del body, on el pick seleccionar los campos que interesan del body 
    //id 'su coleccion, new -> si no existe lo inserta, runVali-> sirve para validar todas las condiciones del modelo 
    Alert.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, aleDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Error al actualizar alerta',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200, 
            msg: 'Alerta actualizada correctamente',
            aleDB
        });

    });
});

app.delete('/eliminar/:idAlert', (req, res) => {
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