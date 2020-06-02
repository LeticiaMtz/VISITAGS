// Librerias requeridas
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const uuid = require('uuid/v4');
// Configuración de librerias
const storegeMulterConfig = multer.diskStorage({
    destination: 'server/public/uploads',
    filename: (req, file, cb) =>{  
        cb(null, uuid() + path.extname(file.originalname)) //file.originalname
    }
});
const multerConfig = multer({
    storage: storegeMulterConfig,
    dest: 'server/public/uploads',
    limits: {fileSize: 10000000},
    fileFilter: (req, file, cb)=>{
        const fileType = /pdf|doc/;
        const mimetype = fileType.test(file.mimetype);
        const extensionName = fileType.test(path.extname(file.originalname).toLocaleLowerCase())
        if (mimetype && extensionName) {
            return cb(null, true);
        }
        cb('Cannot read this file type')
    }
}).single('file');

const { mongoose} = require('./database');

//Settings (Configuraciones)
app.set('port', process.env.PORT || 3000);

//Middleswares (Uso de librerias)
app.use(morgan('dev'));
app.use(express.json())
app.use(cors({origin: 'http://localhost:4200'}));
app.use(multerConfig);

//Routes (Inicialización de rutasde la rest API)
app.use('/users',require('./routes/users.routes'));
app.use('/alerts',require('./routes/alert.routes'));
app.use('/comments',require('./routes/comments.routes'));

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Inicialización del puerto del servidor
app.listen(3000, ()=> {
    console.log("Server On Port ", app.get('port'))
});