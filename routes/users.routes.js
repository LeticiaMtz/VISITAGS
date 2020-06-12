const express = require('express');
const router = express.Router();
const userController = require('../controllers/Users.controller');
const alertController = require('../controllers/Alerts.controller');

// Ruteo de usuarios 
router.get('/', userController.getUsers); // Obtener
router.get('/profile', userController.profile);
router.get('/data/:id', userController.completeData);
router.post('/', userController.createUser); // Registrar
router.get('/:id', userController.getUser);
router.put('/:id', userController.editUser); // Actualizar
router.delete('/:id', userController.deleteUser); //Eliminar

router.post('/login', userController.login);



module.exports = router;