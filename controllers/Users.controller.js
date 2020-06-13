// Librerias requeridas
const user = require('../models/Users');
const alert = require('../models/Alerts');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');
const Users = require('../models/Users');
const Secret_Key = 'secret_key_utags';
const mailer = require('../libraries/mails');
const saltRounds = 10; //for production mode set 12 saltRounds

const userController = {};

// let emailMessage = `
//         <!DOCTYPE html>
//         <html lang="en" dir="ltr">
//           <head>
//             <meta charset="utf-8">
//             <title></title>

//           </head>
//           <body>

//             <h1>¡Gracias por formar parte de Alertas académicas!<h1>
//             <p>Su contraseña es:</p>

//             <a class="waves-effect waves-light btn"  href="http://localhost:4200/main/home">Verificar cuenta</a>

//           </body>
//         </html>

//         `

// Obtener todos los usuarios

userController.getUsers = async(req, res) => {

    const users = await user.find();
    res.json({
        ok: true,
        status: 200,
        msg: 'Lista de usuarios generada exitosamente',
        count: users.length,
        users
    });


}

// Relación de usuarios con alertas
userController.completeData = async(req, res) => {
        const collName = alert.collection.collectionName;
        console.log(collName);
        // const getUs = await user.findById(req.params.id)
        // res.json(getUs._id); 
        // const el_id_chido = getUs._id;
        const data = await user.aggregate([
            // { $match: { _id: id } },
            {
                $lookup: {
                    from: collName,
                    localField: '_id',
                    foreignField: 'id_user',
                    as: 'Alerts'
                }
            }
        ], (err, userData) => {
            // console.log('el id del user');
            // console.log(el_id_chido);
            console.log(Object.keys(userData));

            const data = userData[0].Alerts[0]; //pasar el id
            console.log(userData[0].Alerts[0]);
            console.log('esto tiene data');
            console.log(data);
            // const userDa = new dat(userData[0])
            //  userDa.save();
            res.json(userData);
        })
    }
    // Obtener un solo usuario
userController.getUser = async(req, res) => {
    // verifyToken(req, res);
    const getUs = await user.findById(req.params.id)
    res.json({
        ok: true,
        status: 200,
        msg: 'Usuario encontrado exitosamente',
        count: getUs.length,
        getUs
    });


}

// Obtener el perfil del usuario
userController.profile = async(req, res) => {
    verifyToken(req, res);
    // res.send(req.userId)
    res.json({ UserId: req.userId })
}

// Crear un nuevo usuarios
userController.createUser = async(req, res) => {
    // create hash password
    let pass = req.body.strPassword;
    const hash = bcrypt.hashSync(pass, saltRounds);
    // end hash password

    const passw = req.body.strPassword;
    const OneUser = new Users({
        strName: req.body.strName,
        strLastName: req.body.strLastName,
        strMotherLastName: req.body.strMotherLastName,
        strEmail: req.body.strEmail,
        strPassword: hash,
        strRole: req.body.strRole,
        blnStatus: req.body.blnStatus,
        // alerts: req.body.alerts,
    });
    //const newUser = new user(OneUser)

    // valida que ya exista el correo
    await Users.findOne({ 'strEmail': req.body.strEmail }).then(async(encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'El correo ya ha sido registrado',
                cont: {
                    OneUser
                }
            });
        }
        await new Users(OneUser).save();

        //Create access token
        const accessToken = jwt.sign({ _id: OneUser._id }, Secret_Key);

        let mailOptions = {
            from: 'leticiagpemoreno03@gmail.com',
            to: OneUser.strEmail,
            subject: 'Esta es tu contraseña en caso de no recordarla...',

            html: '<h1>¡Gracias por formar parte de Alertas académicas!</h1><br>' +
                '<h3>Hola ' + OneUser.strName + ' </h3>' + '<h3>Tu contraseña es: </h3>' +
                passw,
        };

        mailer.sendMail(mailOptions);

        // Function with email settings
        // emailSettings(req, res);
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: "User saved",
            token: accessToken
        });

        // Vista del correo electrónico


    }).catch((err) => {

        return res.status(500).json({
            ok: false,
            resp: 500,
            const: {
                err: err.message
            }
        });
    });
    //findOne para buscar un solo resultado y el find para varios resultados 

}


//POST USER NEW (login system)
userController.login = async(req, res) => {

        console.log(req.headers.authorization);
        const userData = {
            strEmail: req.body.strEmail,
            strPassword: req.body.strPassword
        }

        await user.findOne({ strEmail: userData.strEmail }, (err, user) => {
            // console.log(user.password);
            console.log(user);

            if (err) return res.status(400)
            if (!user) {
                res.json({
                    ok: true,
                    status: 200,
                    msg: 'Something is wrong'
                })
            } else {
                const resultPassword = bcrypt.compareSync(userData.strPassword, user.strPassword);
                if (resultPassword) {
                    const accessToken = jwt.sign({ _id: user._id }, Secret_Key)
                    res.json({
                        ok: true,
                        status: 200,
                        msg: 'OK User was found',
                        UserEmail: user.strEmail,
                        UserName: user.strName,
                        UserLastname: user.strLastname,
                        UserRole: user.strRole,
                        // UserStatus: user.blnStatus,
                        token: accessToken
                    })

                } else {
                    res.json({
                        ok: true,
                        status: 200,
                        msg: 'User not found'
                    })
                }
            }

        });
        // console.log(UserFound);


        // if (UserFound) {
        //     res.json({
        //         status: 'User Found',
        //         User: userData
        //     })
        // }else{
        //     res.json({
        //         status:'User not found'}
        //         )
        // }
    }
    // Actualizar a un usuario
userController.editUser = async(req, res) => {
    const { id } = req.params;
    let pass = req.body.strPassword;
    const hash = bcrypt.hashSync(pass, saltRounds);
    const oneUser = {
        strName: req.body.strName,
        strLastname: req.body.strLastName,
        strMotherLastname: req.body.strMotherLastName,
        strEmail: req.body.strEmail,
        strPassword: hash,
        strConfirm_Password: req.body.strConfirm_Password,
        strRole: req.body.strRole,
        blnStatus: req.body.blnStatus,

    };
    await user.findByIdAndUpdate(id, { $set: oneUser }, { new: true });
    res.json({
        ok: true,
        status: 200,
        msg: 'User Updated',
        oneUser
    })
}

// Borrar Usuario
userController.deleteUser = async(req, res) => {

    let desactivar = {
        blnStatus: false
    }

    const usuario = await user.findOneAndUpdate(req.params.id, { $set: desactivar });
    res.json({
        ok: true,
        status: 200,
        msg: "El usuario ha sido desactivado",
        cont: {
            usuario
        }
    })
}

// Verificación del token (jwt)
function verifyToken(req, res, next) {

    if (!req.headers.authorization) {
        return res.status(401).send('Authorization: falied')
    }
    const token = req.headers.authorization.split(' ')[1]
    if (token === 'null') {
        return res.status(401).send('Authorization: falied')
    }
    const payload = jwt.verify(token, Secret_Key)
    console.log(req.headers.authorization);
    console.log(payload);
    req.userId = payload._id;

    console.log(req.userId);

}
// Configuraciones de email
// function emailSettings(req, res) {
//     //EMAIL BLOCK CODE START

//     let transporter = nodemailer.createTransport({
//         host: 'smtp.googlemail.com', // smtp.outlook.com
//         port: 465,
//         secure: true, // use SSL
//         auth: {
//             user: 'leticiagpemoreno03@gmail.com',
//             pass: 'Martinez1214#'
//         }
//     });
//     // setup e-mail data with unicode symbols
//     let mailOptions = {
//         from: 'Test <leticiagpemoreno03@gmail.com>', // sender address
//         to: req.body.strEmail, // list of receivers //mizraimeliab168@gmail.com
//         subject: 'Hello ✔', // Subject line
//         html: emailMessage // html body

//     };
//     // send mail with defined transport object
//     transporter.sendMail(mailOptions, function(error, info) {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message sent: ' + info.response);
//     });
//     // EMAIL BLOCK CODE END
// }



module.exports = userController;