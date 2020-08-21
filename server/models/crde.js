const mongoose = require('mongoose');
const Motivo = require('./motivosCrde');
let Schema = mongoose.Schema;
 
const crde = new Schema({
    strCategoria:{
        type: String,
        required: [true, 'Ingrese el nombre de la categoria']
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

 
module.exports = mongoose.model('Crde', crde);