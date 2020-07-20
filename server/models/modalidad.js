const mongoose = require('mongoose');
const { model } = require('./asignatura');
let Schema = mongoose.Schema;

let modalidadSchema = new Schema({
    strModalidad: {
        type: String,
        required: [true, 'Ingrese la modalidad']
    },
    blnStatus:{
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Modalidad', modalidadSchema );