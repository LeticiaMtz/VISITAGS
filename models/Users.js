const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { Schema } = mongoose;

autoIncrement.initialize(mongoose);
//Creación del esquema de usuarios
const users = new Schema({
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    motherlastname: {type: String, required: true},
    email: {type: String, unique:true, required: true},
    password: {type: String, required:true},
    role: {type: String, required: true},
    direction: {type: String}
    // alerts: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Alerts'
    // }]
},{
    timestamps: true
});

users.plugin(autoIncrement.plugin, {
    model: '_id',
    field: '_id',
    startAt: 1,
    incrementBy: 1
});


module.exports = mongoose.model('Users', users);

