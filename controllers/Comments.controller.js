const alert = require('../models/Alerts');
const comment = require('../models/Comments');

const commentsController = {};

// Obtener todos los comentarios

commentsController.getComments = async (req, res) =>{
    
    const comments = await comment.find();
    res.json(comments);
} 
// Obtener los comentarios con alertas
commentsController.DataComment = async (req , res) =>{
    // await alert.find().populate('comment').exec((err, response)=>
    // {
    //     res.json(response)
    // })
    await comment.find().populate('alert').exec((err, response)=>
    {   
        const ordenado = [];
        const id_alert =[];
        const commenta = [];
        // const completo = [];
        for (let index = 0; index < response.length; index++) {
            const element = response[index];
            // console.log(element.alert);
            for (let index = 0; index < element.alert.length; index++) {
                const alert = element.alert[index];
                console.log(alert._id);

                // if (element.alert === element.alert) {
                //     ordenado.push(alert.id)
                // }
                 id_alert.push(alert._id)
                 commenta.push(element.comment);
                //  res.json({
                //     id_alerta: id_alert,
                //     comments: commenta
                // })
            }
        }
        res.json({
            id_alerta: id_alert,
            comments: commenta
            // odenador: ordenado
        })
        // res.json(response)
    })
    // const getUsComment = await comment.findById(req.params.id);
    // res.json(getUsComment);
}

// /POST new comment
commentsController.NewComment = async (req, res) => {
    const newComment = new comment({
        comment: req.body.comment,
        alert: req.body.alert,
        id_alert: req.body.id_alert
    });
    await newComment.save();
    res.json({
        status: "Comment saved"
    });
}


// /DELETE comment
commentsController.deleteComment = async (req, res) =>{
    await comment.findByIdAndRemove(req.params.id);
    res.json({
        status: "Comment Deleted"
    })
}



module.exports = commentsController;