const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let asignaturaSchema = new Schema({
    strAsignatura:{
        type: String,
        required: [true, 'Ingrese el nombre de la asignatura']
    },
    strSiglas: {
        type: String,
        required: [true, 'Ingrese las siglas de la asignatura'],
    },
    blnStatus: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Asignatura', asignaturaSchema);

