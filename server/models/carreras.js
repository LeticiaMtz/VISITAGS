const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Especialidad = require('./especialidad');
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
  
},{
     timestamps: true
 });




module.exports = mongoose.model('Carreras', carrera);