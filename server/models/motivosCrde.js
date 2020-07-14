const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
 
const motivosCrde = new Schema({
    strNombre:{
        type: String,
        unique: true,
        required: [true, 'Ingrese el nombre del motivo']
    },
    strClave:{
        type: String,
        unique: true,
        required: [true, 'Ingrese la clave del motivo']
    },
    blnStatus: {
        type: Boolean,
        default: true
    }
},  
{
    timestamps: true
});

motivosCrde.plugin(uniqueValidator, { type: 'mongoose-unique-validator' });
 
module.exports = mongoose.model('motivosCrde', motivosCrde);