const Role = require ('../models/Roles'); 
const CategoriaApi = require ('../models/CategoriaApi');

const rolMenuUsuario  = async (req, res, next) => {
    stUrl = req.originalUrl.split('/');
    let url = String('/' + stUrl[1] + '/' + stUrl[2] + '/' + stUrl[3]); 
    let role = req.user.idRole; 
    let posiciones = stUrl.length - 1; 
    let blnNext = false; 
    req.user.stUrl = url; 

    if (posiciones > 3) {
        for (let i = 0; i < (posiciones - 3); i++) {
            url = url + '/param';
        }
    }

    await Role.findOne({ '_id': role, 'blnStatus': true }).then(async (resp) => {
        console.log(resp._id, role);
        if (resp == null) {
            res.status(404).send({
                status: 400,
                ok: false,
                msg: 'No se encontro ese rol en la base de datos o se encuentra desactivado',
                cont: {
                    resp
                }
            });
        } else {
            await CategoriaApi.find({
                'aJsnRutas._id': {
                    $in: resp.arrApi
                }

            }).then(async (categorias) => {
                console.log(categorias);
                categorias.forEach(categoria => {
                    blnCat = categoria.blnStatus;
                    let rutas = categoria.aJsnRutas;
                    rutas.forEach(element => {
                        if (element.strRuta.toString() === url.toString() && blnCat === true && element.blnStatus === true) {
                            resp.arrApi.forEach(api => {
                                console.log(api._id , element._id);
                                
                                if (api._id.toString() === element._id.toString()) {
                                    blnNext = true;
                                }
                            });
                        }
                    });
                });
            })
                .catch(err => {
                    return res.status(400).json({
                        ok: false,
                        resp: 400,
                        cont: {
                            err: err.message
                        }
                    });
                });

            if (blnNext === true) {
                next();
            } else {
                return res.status(403).json({
                    ok: true,
                    resp: 403,
                    msg: 'No se cuenta con los permisos necesarios para realizar esta acción o la categoria no se encuentra habilitada en estos momentos',
                    cont: {
                        RequestUrl: url
                    }
                });
            }
        }
    }).catch((err) => {
        res.status(500).send({
            ok: false,
            status: 500,
            msg: 'Error al intentar obtener los roles',
            cont: {
                err
            }
        });
    });
};

module.exports = {
    rolMenuUsuario
};

