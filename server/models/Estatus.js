const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Estatus = new Schema({
    strNombre: {
        type: String,
        unique: true,
        required: [true, 'Ingrese el nombre del motivo']
    },
    strDescripcion: {
        type: String,
        required: [true, 'Ingrese una descripción']
    },
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Estatus', Estatus);