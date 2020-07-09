const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Asignatura = require('../models/asignatura');
const {rolMenuUsuario} = require('../middlewares/permisosUsuarios');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

//Obtiene todos las asignaturas
app.get('/obtener', (req, res) => {

    Asignatura.find() 
        //solo aceptan valores numericos
        .exec((err, asignatura) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            console.log(req.asignatura);
            return res.status(200).json({
                ok: true,
                count: asignatura.length,
                asignatura
            });
        });
});

//Obtener una asignatura por id 
app.get('/obtener/:id', (req, res) => {
    let id = req.params.id;
    Asignatura.find({ _id: id })
        .exec((err, asignatura) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar la asignatura',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se ha consultado correctamente la asignatura',
                cont: asignatura.length,
                cnt: asignatura
            });
        });
});


app.post('/registrar', async (req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let asignatura = new Asignatura({
        strAsignatura: body.strAsignatura,
        strSiglas: body.strSiglas,
        blnStatus: body.blnStatus
    });
    

    Asignatura.findOne({ 'strAsignatura': body.strAsignatura }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'La asignatura ya ha sido registrada',

            });
        }
        asignatura.save((err, asignatura) => {
            if(err){
                return res.status(400).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Asignatura registrada correctamente",
                cont: {
                    asignatura
                }
            });
        });
    });

});


app.post('/registrar/cargaMasiva', async (req, res) => {
    let asignatura = new Asignatura();
    let elem = 0;
    let body = req.body;
    //console.log(body.cargaMasiva);


    body.cargaMasiva.forEach( element => {
        asignatura = new Asignatura({
            strAsignatura: element.strAsignatura,
            strSiglas: element.strSiglas,
            blnStatus: element.blnStatus
        });
        elem++
        insertToDatabase(asignatura, element.strAsignatura, elem);
    });
    res.json({
        status: 'Carga Masiva finalizada'
    })
});

app.put('/actualizar/:idAsignatura', (req,res) => {
    let id = req.params.idAsignatura;

    const asignaturaBody =  _.pick(req.body,['strAsignatura', 'strSiglas', 'blnStatus']);
    Asignatura.find({_id: id}).then((resp) => {
        if(resp.length > 0){
            Asignatura.findByIdAndUpdate(id,asignaturaBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Asignatura actualizada exitosamente',
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

app.delete('/eliminar/:idAsignatura',  (req, res) => {
    let id = req.params.idAsignatura;

    Asignatura.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la asignatura',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la asignatura',
            cnt: resp
        });
    });
});

let insertToDatabase = (asignatura, strAsignaturaParam, elem) => {
    Asignatura.findOne({ 'strAsignatura': strAsignaturaParam }).then( encontrado  => {
        if (encontrado) return console.log(`registro ${strAsignaturaParam} repetido: num registro ${elem}`);

        asignatura.save().then( guardado  => {
            if (!guardado) return console.log(`error al guardar ${strAsignaturaParam}, num registro ${elem}`);
            if (guardado) return console.log(`asignatura: ${strAsignaturaParam} guardada: num registro ${elem}`);
        }).catch(err => {
            return console.log(`error de METODO al guardar: se que quedo en el registro ${elem}: ${err}`);
        });
    }).catch(err => {
        return console.log(`error de METODO al buscar duplicados: se que quedo en el registro ${elem}: ${err}`);
    });
}

module.exports = app;
