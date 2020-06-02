const mongoose = require('mongoose');
const { Schema } = mongoose;
// Creación de esquema de alertas
const alerts = new Schema({
    matricula: { type: Number, required: false },
    student_name: { type: String, required: false },
    educational_program: { type: String, required: false },
    incidence: { type: String, required: false },
    tracing: { type: String, required: false },
    id_user : {type: Number },
    // comment: [{type: String}],
    // comment: [{type: Schema.ObjectId, ref: "Comment"}],
    date: {type: Date, default: Date.now}
});




module.exports = mongoose.model('Alerts', alerts);