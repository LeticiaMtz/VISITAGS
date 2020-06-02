const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/Comments.controller');


    // Ruteo de comentarios
    router.get('/', commentsController.getComments);
    router.post('/', commentsController.NewComment);
    router.get('/data', commentsController.DataComment);
    router.delete('/:id', commentsController.deleteComment);
    // router.put('/:id', userController.editUser);




module.exports = router;