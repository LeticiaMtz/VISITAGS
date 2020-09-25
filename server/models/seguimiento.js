const mongoose = require('mongoose');
const User = require('./Users')
const Estatus = require('./Estatus')
const Evidencias = require('./evidencias');
let Schema = mongoose.Schema;
// Creación de esquema de alertas
const seguimiento = new Schema({
    idUser: {
       type: Schema.Types.ObjectId, 
       ref: 'User'
      
   },
   idEstatus: {
       type: Schema.Types.ObjectId, 
       ref: 'Estatus'
   },
   arrInvitados: [{
    type: Schema.Types.ObjectId,
    ref: 'User',

   }],
    strComentario: { 
        type: String,
    }, 
    aJsnEvidencias: [Evidencias.schema],
    blnStatus:{
        type: Boolean, 
        default: true

    }
},{
    timestamps: true
});

module.exports = mongoose.model('Seguimiento', seguimiento);
