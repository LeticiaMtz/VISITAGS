const mongoose = require('mongoose');
const { Schema } = mongoose;
const Api = require('./Api');
// Creación de esquema de alertas
const categoriaApi = new Schema({
    strName: { 
        type: String,
        required: [true, 'Porfavor ingresa el nombre de la categoria']
    }, 
    strDescripcion:{
        type: String, 
        required: [true, 'Porfavor ingresa una descripcion']
    }, 
    blnStatus:{
        type: Boolean, 
        default: true
    }, 
    aJsnRutas: [Api.schema]


}, {collection: "categoriaApi"});



module.exports = mongoose.model('CategoriasApi', categoriaApi);