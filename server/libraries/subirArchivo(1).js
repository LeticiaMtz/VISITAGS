/* jshint esversion: 8 */
const express = require('express');
const fileUpload = require('express-fileupload');
const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs');
const app = express();
const mv = require('move-file');

app.use(fileUpload());

const subirArchivo = async(file, route) => {
    let nameImg = uniqid() + path.extname(file.name);

    if (!exts.includes(file.mimetype)) {
        throw new Error(`Sólo las extensiones (${exts.join(', ')}) son aceptadas`);
    }

     await file.mv(path.resolve(__dirname, `../../uploads/${route}/${nameImg}`)).catch((error) => {
         console.log(error);
         throw new Error('Error al tratar de subir el archivo al servidor');
    // await file.mv(`uploads/${route}/${nameImg}`, (err) => { //Es todo el path de la imagen
    //     if (err) {
    //         console.log(err)
    //     }
     });


    return nameImg;
};

const borraArchivo = async(nombreImagen, ruta) => {
    let pathImg = path.resolve(__dirname, `uploads/${ruta}/${nombreImagen}`);
    if (fs.existsSync(pathImg)) {
        await fs.unlinkSync(pathImg);
    }
};

module.exports = {
    subirArchivo,
    borraArchivo
};