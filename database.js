// Conexión a la base de datos
const mongoose = require('mongoose');

const URI = 'mongodb://localhost/test_complete';

mongoose.connect(URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(db => console.log("DB is conected"))
    .catch(err => console.error(err))
module.exports = mongoose;