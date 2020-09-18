const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const motivosCrde = new Schema({
    strNombre: {
        type: String,
        required: [true, 'Ingrese el nombre del motivo']
    },
    strClave: {
        type: String,
        required: [true, 'Ingrese la clave del motivo']
    },
    blnStatus: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('motivosCrde', motivosCrde);