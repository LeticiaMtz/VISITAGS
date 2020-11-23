const { rolMenuUsuario } = require("../middlewares/permisosUsuarios");
const { verificaToken } = require("../middlewares/autenticacion");

//PUERTO
process.env.PORT = process.env.PORT || 3000;
// Declaracion de entorno, funcion que nos dara en que ambiente estamos
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//Declaracion de credenciales de correo.
process.env.DIRECCION_CORREO = process.env.DIRECCION_CORREO || 'notificaciones.desarrollo@utags.edu.mx';
process.env.CONTRASENIA_CORREO = process.env.CONTRASENIA_CORREO || '!9,G\\qEqU8p==>jE';
//Conexion a la base de datios 
let urlDB;

//URL DEL FRONT-END PRODUCCIÓN
// process.env.URL_FRONT = process.env.URL_FRONT || 'https://seguimiento-tutoral.fs.utags.edu.mx/#/';
process.env.URL_FRONT = process.env.URL_FRONT || 'https://localhost:4200/#/';

// if (process.env.NODE_ENV === 'dev') { //Son todas las funciones y procesos que tienen el amibiente del desarrollo que es local 
//     urlDB = 'mongodb+srv://AdminAA:AlertasAcademicas@cluster0-mquqh.mongodb.net/AlertasAcademicas?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
//     process.log = true;
// } else { //Ambiente de produccion nube = Heroku
//     urlDB = 'mongodb+srv://AdminAA:AlertasAcademicas@cluster0-mquqh.mongodb.net/AlertasAcademicas?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
// }

if (process.env.NODE_ENV === 'dev') { //Son todas las funciones y procesos que tienen el amibiente del desarrollo que es local 
    urlDB = 'mongodb+srv://AdminAA:AlertasAcademicas@cluster0-mquqh.mongodb.net/AlertasAcademicas_test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
    process.log = true;
} else { //Ambiente de produccion nube = Heroku
    urlDB = 'mongodb+srv://AdminAA:AlertasAcademicas@cluster0-mquqh.mongodb.net/AlertasAcademicas_test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
}

//Tenemos dos ambientes el de produccion y el de desarrollo 

//env = entorno  
process.env.URLDB = urlDB;

//Firma de JWt 
process.env.SEED = process.env.SEED || 'Frima-super-secreta';

process.env.CADUCIDAD_TOKEN = process.env.CADUCIDAD_TOKEN || '12h';

process.middlewares = [verificaToken, rolMenuUsuario];