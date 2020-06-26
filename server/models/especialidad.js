const mongoose = require('mongoose');
const { Schema } = mongoose;
// Creación de esquema de alertas
const especialidad = new Schema({
    strEspecialidad: { 
        type: String,
        required: [true, 'Porfavor ingresa el nombre de la especialidad'], 
        unique: true
    }, 
    blnStatus:{
        type: Boolean, 
        default: true

    }
}, {collection: "especialidad"});



module.exports = mongoose.model('Especialidad', especialidad);