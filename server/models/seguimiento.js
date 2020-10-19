const mongoose = require('mongoose');
const User = require('./Users')
const Estatus = require('./Estatus')
const Evidencias = require('./evidencias');
let Schema = mongoose.Schema;
// Creación de esquema de alertas

let schemaOptions = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'Seguimiento'
};


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
    blnStatus: {
        type: Boolean,
        default: true

    }
}, {
    timestamps: true
}, schemaOptions);


module.exports = mongoose.model('Seguimiento', seguimiento);