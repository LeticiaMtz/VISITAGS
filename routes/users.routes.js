const express = require('express');
const router = express.Router();
const userController = require('../controllers/Users.controller');
const alertController = require('../controllers/Alerts.controller');

    // Ruteo de usuarios 
    router.get('/', userController.getUsers);
    router.get('/profile', userController.profile);
    router.get('/data/:id', userController.completeData);
    router.post('/', userController.createUser);
    router.get('/:id', userController.getUser);
    router.put('/:id', userController.editUser);
    router.delete('/:id', userController.deleteUser);

    router.post('/login' , userController.login);



module.exports = router;