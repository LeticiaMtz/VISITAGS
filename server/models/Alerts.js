const mongoose = require('mongoose');
const User = require('./Users')
const { Schema } = mongoose;
// Creación de esquema de alertas
const alerts = new Schema({
    strMatricula: {
         type: Number, 
         required: [true, 'Porfavor ingresa la matricula']
    },
    strStudentName: {
         type: String,
         required: [true, 'Porfavor ingresa el nombre completo del estudiante']
    },
    strEducationalProgram: { 
        type: String, 
        required: [true, 'Porfavor ingresa el programa educativo'] 
    },
    strIncidence: { 
        type: String, 
        required: [true, 'Porfavor ingresa la insidencia'] 
    },
    strTracing: { 
        type: String, 
        required: [true, 'Porfavor ingresa el seguimiento']
    },
    strUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Por favor ingrese el usuario']
       
    },
    //id_user : {type: Number },
    // comment: [{type: String}],
    // comment: [{type: Schema.ObjectId, ref: "Comment"}],
    dteDate: {
        type: Date, 
        default: Date.now
    }, 
    blnStatus: {
        type: Boolean, 
        default: true
    }

});




module.exports = mongoose.model('Alerts', alerts);