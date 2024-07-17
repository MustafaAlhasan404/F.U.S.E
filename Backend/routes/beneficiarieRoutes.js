const express = require('express');
const router = express.Router();
const beneficiarieController = require('../controllers/beneficiarieController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createBeneficiarySchema, updateBeneficiarySchema } = require('../validationSchemas');

//router.get('/create', beneficiarieController.create);

router.get('/', beneficiarieController.index);
router.post('/', validateRequest(createBeneficiarySchema), beneficiarieController.store);
router.get('/:id', beneficiarieController.show);
router.put('/:id', validateRequest(updateBeneficiarySchema), beneficiarieController.update);
router.delete('/:id', beneficiarieController.destroy);

module.exports = router;
