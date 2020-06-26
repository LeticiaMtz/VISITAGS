const mongoose = require('mongoose');
const Especialidad = require('./especialidad');
const { Schema } = mongoose;
// Creación de esquema de alertas
const carrera = new Schema({
    strCarrera: {
         type: String, 
         required: [true, 'Porfavor ingresa el nombre de la carrera'],
         unique: true
    },
    
    blnStatus: {
         type: Boolean,
         default: true
    },
    aJsnEspecialidad: [Especialidad.schema]
  
}, {collection: "carreras"});




module.exports = mongoose.model('Carreras', carrera);