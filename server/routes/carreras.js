const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Carrera = require('../models/carreras');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

app.get('/obtener', [verificaToken, rolMenuUsuario], (req, res) => {
    Carrera.find()
        .exec((err, carDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las carreras',
                    cnt: err
                });
            }

            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carreras consultadas correctamente',
                cont: carDB.length,
                cnt: carDB
            });
        });
});

app.get('/obtener/:idCarrera', [verificaToken, rolMenuUsuario], (req, res) => {
    let id = req.params.id;
    Carrera.find({ _id: id })
        .exec((err, carDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carrera consultada correctamente',
                cont: carDB.length,
                cnt: carDB
            });
        });
});

app.post('/registrar', async (req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let carrera = new Carrera({
        strCarrera: body.strCarrera,
        blnStatus: body.blnStatus, 
        aJsnEspecialidad: body.aJsnEspecialidad

    });
    

    Carrera.findOne({ 'strCarrera': body.strCarrera }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'La carrera ya ha sido registrada',

            });
        }
        carrera.save((err, carrera) => {
            if(err){
                return res.status(400).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Carrera registrado correctamente",
                cont: {
                    carrera
                }
            });
        });
    });

});



app.put('/actualizar/:idCarrera', [verificaToken, rolMenuUsuario], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['strCarrera']);
    Carrera.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, carDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al actualizar la carrera',
                cnt: err
            });
        }

        return res.status(200).json({
            ok: true,
            resp: 200,
            msg: 'La respuesta se ha actualizado exitosamente.',
            cont: {
                carDB
            }
        });
    });
});

app.delete('/eliminar/:idCarrera', [verificaToken, rolMenuUsuario],  (req, res) => {
    let id = req.params.id;

    Carrera.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la carrera',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la carrera',
            cnt: resp
        });
    });
});

module.exports = app;