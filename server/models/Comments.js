const mongoose = require('mongoose');
const Alert = require('./Alerts')
const { Schema } = mongoose;
// Creación de esquema de comentarios
const comments = new Schema({
    strComment: {
        type:String
    },
    strAlert: {
        type: Schema.Types.ObjectId,
        ref: 'Alert',
        required: [true, 'Por favor ingrese la alerta']
    },
   
    // alert: {type: Schema.ObjectId}
    blnStatus: {
        type: Boolean, 
        default: true
    }

},{
    timestamps: true
});


module.exports = mongoose.model('Comment', comments);