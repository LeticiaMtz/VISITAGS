const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Motivo = require('./motivosCrde');
let Schema = mongoose.Schema;
 
const crde = new Schema({
    strCategoria:{
        type: String,
        required: [true, 'Ingrese el nombre de la categoria'],
        unique: true
    },
    aJsnMotivo: [Motivo.schema],
    blnStatus: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
}, 
{collection: "crde"});

crde.plugin(uniqueValidator, {
    message: '{PATH} Debe ser único y diferente'
});
 
module.exports = mongoose.model('Crde', crde);