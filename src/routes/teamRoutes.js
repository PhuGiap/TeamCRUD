const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');

router.post('/', TeamController.create);
router.get('/', TeamController.getAll);
router.get('/:id', TeamController.getById);
router.put('/:id', TeamController.update);
router.delete('/:id', TeamController.delete);

module.exports = router;
