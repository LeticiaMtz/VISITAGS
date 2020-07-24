const mongoose = require('mongoose');
let Schema = mongoose.Schema;
// Creación de esquema de alertas
const evidencias = new Schema({
    strNombre: { 
        type: String,
        required: [true, 'Porfavor ingresa el nombre de la evidencia'],
    }, 
    strFileEvidencia: { 
        type: String,
    },
    blnStatus:{
        type: Boolean, 
        default: true

    }
},{
    timestamps: true
});

module.exports = mongoose.model('Evidencias', evidencias);
