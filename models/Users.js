const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { Schema } = mongoose;

autoIncrement.initialize(mongoose);
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
        type: String,
        required: [true, 'Favor de ingresar el segundo apellido ']
    },
    strEmail: {
        type: String,
        unique: true,
        required: [true, 'Favor de ingresar el correo ']
    },
    strPassword: {
        type: String,
        required: [true, 'Favor de ingresar la contraseña ']
    },
    strRole: {
        type: String,
        default: 'Profesor'
    },
    blnStatus: {
        type: Boolean,
        default: true
    }

    // alerts: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Alerts'
    // }]
}, {
    timestamps: true
});

users.plugin(autoIncrement.plugin, {
    model: '_id',
    field: '_id',
    startAt: 1,
    incrementBy: 1
});


module.exports = mongoose.model('Persona', users);