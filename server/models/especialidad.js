const mongoose = require('mongoose');
let Schema = mongoose.Schema;
// Creación de esquema de alertas
const especialidad = new Schema({
    strEspecialidad: { 
        type: String,
        required: [true, 'Porfavor ingresa el nombre de la especialidad']
    }, 
    blnStatus:{
        type: Boolean, 
        default: true

    }
},{
    timestamps: true
});

module.exports = mongoose.model('Especialidad', especialidad);


