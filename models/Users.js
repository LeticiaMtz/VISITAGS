const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { Schema } = mongoose;

autoIncrement.initialize(mongoose);
//Creación del esquema de usuarios
const users = new Schema({
   StrName: {type: String, required: true},
   StrLastname: {type: String, required: true},
   StrMotherLastname: {type: String, required: true},
   StrEmail: {type: String, unique:true, required: true},
   StrPassword: {type: String, required:true},
   StrRole: {type: String, default: 'Profesor'},
    //BlnStatus: {type: Boolean, default: true}
    
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
