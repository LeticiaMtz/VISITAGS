const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { Schema } = mongoose;
const Role = require('./Roles')

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
        type: String
        
    },
    strEmail: {
        type: String,
        unique: true,
        required: [true, 'Favor de ingresar el correo ']
        // validate: {
        //     validator: function(v) {
        //         return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/.test(v);
        //     },
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


module.exports = mongoose.model('User', users);