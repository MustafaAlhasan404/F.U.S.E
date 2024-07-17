const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createBillSchema, payBillSchema } = require('../validationSchemas');
const { decryptionMobile } = require('../middleware/mobileEncryptionMiddleware');
const { isMerchant } = require('../middleware/authRole');

//router.get('/create', billController.create);

router.put('/', decryptionMobile, isMerchant, validateRequest(createBillSchema), billController.store);
router.post('/unpaid',isMerchant, decryptionMobile, billController.showUnpaid);
router.post('/:id', decryptionMobile, billController.show);
router.post('/pay/:id', decryptionMobile, validateRequest(payBillSchema), billController.pay);

module.exports = router;
