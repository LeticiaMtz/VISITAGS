const mongoose = require('mongoose');
const { Schema } = mongoose;
// Creación de esquema de alertas
const apis = new Schema({
    strNameApi: { 
        type: String,
        required: [true, 'Porfavor ingresa el nombre de la api']
    }, 
    strRuta:{
        type: String, 
        required: [true, 'Porfavor ingresa la ruta de la api']
    }, 
    blnStatus:{
        type: Boolean, 
        //required: [true, 'Porfavor ingresa el estado de la api']
        default: true
    }
    

}, {collection: "Api"});




module.exports = mongoose.model('Api', apis);