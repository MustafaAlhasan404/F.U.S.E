const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { isEmployee } = require('../middleware/authRole');
const { 
    createTransferSchema,
    createBillSchema, 
    createDWSchema, 
    payBillSchema, 
    updateTransactionSchema 
} = require('../validationSchemas');
const encry = require('../middleware/encryptionMiddleware')
const encryM = require('../middleware/mobileEncryptionMiddleware')

//router.get('/create', transactionController.create);

router.post('/all', transactionController.index);
router.post("/topUp", encry.decryption, transactionController.showTopUp);
router.post('/fromTo', encry.decryption, transactionController.showTransactionsFromTo);
router.post('/cash/deposit', isEmployee, encry.decryption, validateRequest(createDWSchema), transactionController.storeDeposit);
router.post('/cash/withdraw', isEmployee, encry.decryption, validateRequest(createDWSchema), transactionController.storeWithdraw); 

router.post('/transfer',encryM.decryptionMobile, validateRequest(createTransferSchema), transactionController.storeTransfer);

router.post('/:id', transactionController.show);
router.put('/:id', validateRequest(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.destroy);

module.exports = router;
