const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Carrera = require('../models/carreras');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

//Obtiene todos las carreras
app.get('/obtener', (req, res) => {

    Carrera.find({ blnStatus: true }) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, carrera) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            console.log(req.carrera);
            return res.status(200).json({
                ok: true,
                count: carrera.length,
                carrera
            });
        });
});
//Obtener una carrera por id 
app.get('/obtener/:id', (req, res) => {
    let id = req.params.id;
    Carrera.find({ _id: id })
        .exec((err, carrera) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente la carrera',
                cont: carrera.length,
                cnt: carrera
            });
        });
});




// app.get('/obtener/:idCarrera',  (req, res) => {
//     Carrera.findById(req.params.id)
//         .exec((err, carDB) => {
//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     status: 400, 
//                     msg: 'Error al encontrar la carrera',
//                     err
//                 });
//             }
//             return res.status(200).json({
//                 ok: true, 
//                 status: 200, 
//                 msg: 'Carrera encontrada',
//                 carDB
//             });
//         });
// });

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



app.put('/actualizar/:idCarrera',(req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['strCarrera', 'blnStatus', 'aJsnEspecialidad' ]);
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

app.delete('/eliminar/:idCarrera',  (req, res) => {
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