const express = require('express');
const router = express.Router();
const alertController = require('../controllers/Alerts.controller');


    // Ruteo alertas
    router.get('/', alertController.getAlerts);
    router.get('/comments', alertController.comments);
    router.post('/', alertController.createAlert);
    router.post('/comments/:id', alertController.comments);
    router.post('/file', alertController.uploadFile);
    router.get('/download/:file(*)', alertController.download);
    router.get('/:id', alertController.getAlert);
    router.put('/:id', alertController.editAlert);
    router.delete('/:id', alertController.deleteAlert);

module.exports = router;