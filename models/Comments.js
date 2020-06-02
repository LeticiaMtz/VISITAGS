const mongoose = require('mongoose');
const { Schema } = mongoose;
// Creación de esquema de comentarios
const comments = new Schema({
    comment: {type:String},
    alert: {type:String}
    // alert: {type: Schema.ObjectId}
},{
    timestamps: true
});


module.exports = mongoose.model('Comment', comments);