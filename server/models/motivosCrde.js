const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

const motivosCrde = new Schema({
    strNombre: {
        type: String,
        unique: true,
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

motivosCrde.plugin(uniqueValidator, {
    message: 'El {PATH} debe ser unico.'
});

module.exports = mongoose.model('motivosCrde', motivosCrde);