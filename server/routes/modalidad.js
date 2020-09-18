const express = require('express');
const mongoose = require('mongoose');
const _ = require('underscore');
const Modalidad = require('../models/modalidad');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

//|----------------- Api GET de Modalidad -----------------------|
//| Creada por: Martin Palacios                                  |
//| Api que obtiene los tipos de modalidad                       |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/modalidad/obtener            |
//|--------------------------------------------------------------|
app.get('/obtener', (req, res) => {
    Modalidad.find()
        .exec((err, modalidad) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las modalidades',
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Modalidades consultadas exitosamente',
                cont: modalidad.length,
                cnt: modalidad
            });
        });
});

//|----------------- Api GET by id de Modalidad -----------------|
//| Creada por: Martin Palacios                                  |
//| Api que obtiene un tipos de modalidad especifico mediante    |
//| un ID                                                        |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/modalidad/obtener/id         |
//|--------------------------------------------------------------|
app.get('/obtener/:id', (req, res) => {
    let id = req.params.id;
    Modalidad.find({ _id: id })
        .exec((err, modalidad) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar la modalidad',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Modalidad consultada exitosamente',
                cont: modalidad.length,
                cnt: modalidad
            });
        });
});

//|----------------- Api POST de Modalidad-- -----------------------------------------------------------|
//| Creada por: Martin Palacios                                                                         |
//| Api que registra tipos de modalidad                                                                 |
//| modificada por: Isabel Castillo                                                                     |
//| Fecha de modificacion: 02/09/20                                                                     |
//| cambios: Se agrego una validación para que la primera letra de la primera palabra sea mayúscula     |
//| Ruta: http://localhost:3000/api/modalidad/registrar                                                 |
//|-----------------------------------------------------------------------------------------------------|

app.post('/registrar', async(req, res) => {
    let body = req.body;

    //para poder mandar los datos a la coleccion
    let modalidad = new Modalidad({
        strModalidad: body.strModalidad,
        blnStatus: body.blnStatus
    });


    Modalidad.findOne({ _id: { $ne: [mongoose.Types.ObjectId(req.params.idModalidada)] }, strModalidad: { $regex: `^${modalidad.strModalidad}$`, $options: 'i' } }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'La modalidad ya ha sido registrada',
                cnt: encontrado
            });
        }
        modalidad.save((err, modalidad) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al registrar la modalidad',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Modalidad registrada exitosamente",
                cont: modalidad.length,
                cnt: modalidad
            });
        });
    });
});

//|-------------------Api PUT de Modalidad----------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que actualiza el tipo de modalidad                            |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/modalidad/actualizar/idModalidad  |
//|-------------------------------------------------------------------|
app.put('/actualizar/:idModalidad', (req, res) => {
    let id = req.params.idModalidad;
    let numParam = Object.keys(req.body).length;

    let modalidadBody;
    if (numParam == 6) {
        modalidadBody = _.pick(req.body, ['strModalidad', 'blnStatus']);
    }
    if (numParam == 1) {
        modalidadBody = _.pick(req.body, ['blnStatus']);
    }
    if (numParam !== 6 && numParam !== 1) {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar la modalidad',
            err: 'El número de parametros enviados no concuerdan con los que requiere la API'
        });
    }

    Modalidad.findOne({ _id: { $ne: [id] }, strModalidad: { $regex: `^${modalidadBody.strModalidad}$`, $options: 'i' } }).then((resp) => {

        console.log(resp);
        if (resp) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: `La modalidad ${modalidadBody.strModalidad} ya existe `,
                err: resp
            });
        }

        // if (resp.length > 0) {
        Modalidad.findByIdAndUpdate(id, modalidadBody).then((resp) => {
            //console.log(resp);
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Modalidad actualizada exitosamente',
                cont: resp.length,
            });
        }).catch((err) => {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar la modalidad',
                cnt: err
            });
        });
        // }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar la modalidad',
            cnt: err
        });
    });
});

//|-------------------Api DELETE de Modalidad----------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que elimina (desactiva) el tipo de modalidad                  |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/modalidad/eliminar/idModalidad    |
//|-------------------------------------------------------------------|
app.delete('/eliminar/:idModalidad', (req, res) => {
    let id = req.params.idModalidad;

    Modalidad.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la modalidad',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la modalidad',
            cont: resp.length,
            cnt: resp
        });
    });
});

module.exports = app;