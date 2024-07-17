const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createCardSchema, updateCardSchema, updatePINSchema, updateBalanceSchema } = require('../validationSchemas');
const { decryptionMobile } = require('../middleware/mobileEncryptionMiddleware');


router.get('/', cardController.index);
router.post('/', decryptionMobile, validateRequest(createCardSchema), cardController.store);
router.post('/account/:id', decryptionMobile, cardController.showByAccountId);
router.post('/user', decryptionMobile, cardController.showByUserId);
router.post('/:id', cardController.show);
router.put('/pin/:id', decryptionMobile, validateRequest(updatePINSchema), cardController.updatePIN);
router.put('/balance/:id', decryptionMobile, validateRequest(updateBalanceSchema), cardController.updateBalance);
//router.put('/:id', validateRequest(updateCardSchema), cardController.update);
router.delete('/:id', cardController.destroy);

module.exports = router;
