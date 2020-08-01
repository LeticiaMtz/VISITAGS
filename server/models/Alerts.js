const mongoose = require('mongoose');
const User = require('./Users')
const Estatus = require('./Estatus')
const Asignatura = require('./asignatura')
const Especialidad = require('./especialidad')
const Crde = require('./crde')
const Evidencias = require('./evidencias');
const Seguimiento = require('./seguimiento');
let Schema = mongoose.Schema;
// Creación de esquema de alertas
const alerts = new Schema({
    idUser: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
   },
   idEstatus: {
       type: Schema.Types.ObjectId, 
       ref: 'Estatus'
   },
    strMatricula: {
         type: String, 
         required: [true, 'Porfavor ingresa la matricula']
    },
    strNombreAlumno: {
         type: String,
         required: [true, 'Porfavor ingresa el nombre completo del estudiante']
    },
    idAsignatura: {
        type: Schema.Types.ObjectId, 
        ref: 'Asignatura',
        required: [true, 'Porfavor ingresa la asignatura']
    },
    idCarrera: {
        type: Schema.Types.ObjectId, 
        ref: 'Carrera', 
        required: [true, 'Porfavor ingresa la carrera']
    }, 
    idEspecialidad: {
        type: Schema.Types.ObjectId, 
        ref: 'Especialidad', 
        required: [true, 'Porfavor ingresa la especialidad']
    },
    strGrupo: {
        type: String, 
        required: [true, 'Porfavor ingresa el grupo']
   },
   chrTurno: {
    type: String, 
    required: [true, 'Porfavor ingresa el turno']
   },
   idModalidad: {
    type: Schema.Types.ObjectId, 
    ref: 'Modalidad'
   },
   strDescripcion: {
       type:String, 
       required: [true, 'Porfavor ingresa alguna descripcion']
   }, 
   arrCrde: [{
        type: Schema.Types.ObjectId, 
        ref: 'Crde',
        required: [true, 'Porfavor ingresa el motivo crde']
   }],
   aJsnEvidencias: [Evidencias.schema], 
   aJsnSeguimiento: [Seguimiento.schema], 
   blnStatus:{
    type: Boolean, 
    default: true

}
},{
    timestamps: true
});

module.exports = mongoose.model('Alerts', alerts);