const mongoose = require('mongoose');
let Schema = mongoose.Schema;
// Creación de esquema de alertas
const roles = new Schema({
    strRole: { 
        type: String,
        required: [true, 'Porfavor ingresa el nombre del rol']
    }, 
    strDescripcion:{
        type: String, 
        required: [true, 'Porfavor ingresa una descripcion']
    }, 
    blnStatus:{
        type: Boolean, 
        default: true
    }, 
    arrApi: [{
        type: Schema.Types.ObjectId, 
        ref: 'CategoriaApi.aJsnRutas'
    }]


},{
    timestamps: true
});

module.exports = mongoose.model('Role', roles);
