const mongoose = require('mongoose');
const { Schema } = mongoose;
const Role = require('./Roles')
const Especialidad = require('./especialidad')

//Creación del esquema de usuarios
const users = new Schema({
    strName: {
        type: String,
        required: [true, 'Favor de ingresar el nombre ']
    },
    strLastName: {
        type: String,
        required: [true, 'Favor de ingresar el primer apellido ']
    },
    strMotherLastName: {
        type: String

    },
    strEmail: {
        type: String,
        required: [true, 'Favor de ingresar el correo ']
    },
    strPassword: {
        type: String,
        required: [true, 'Favor de ingresar la contraseña ']
    },
    idRole: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: '5eeee0db16952756482d1868'

    },
    arrEspecialidadPermiso: [{
        type: Schema.Types.ObjectId, 
        ref: 'Especialidad'
    }],
    blnStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('User', users);