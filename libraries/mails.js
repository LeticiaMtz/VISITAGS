// Se utiliza la librería Nodemailer que nos permite el envío de correos.
const nodemailer = require('nodemailer');

/*
Se realiza una class para que sea más genérico y se puedan utilizar en diferentes apis si es que se requiere.
*/
class Mailer {

    constructor() {
        this.transport = nodemailer.createTransport({

            service: 'gmail',
            port: 8000,
            secure: false,
            auth: {
                user: 'leticiagpemoreno03@gmail.com',
                pass: 'Martinez1214#'
            },
            tls: {
                rejectUnauthorized: false
            }

        });
        this.mailOptions = {
            from: 'Alertas Académicas <leticiagpemoreno03@gmail.com>'

        };
    }

    sendMail(options) {
        // Opciones que se requieren enviar 
        let mailOptions = {
            ...this.mailOptions,
            ...options
        };

        this.transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
    }
}



module.exports = new Mailer();