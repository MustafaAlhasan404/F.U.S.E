const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createAccountSchema, updateAccountSchema } = require('../validationSchemas');
const { decryptionMobile } = require('../middleware/mobileEncryptionMiddleware');


router.get('/', accountController.index);
router.post('/', validateRequest(createAccountSchema), accountController.store);
router.post('/user', decryptionMobile, accountController.showUserAccounts);
router.post('/user/:id', decryptionMobile, accountController.showUserById);
router.post('/:id', accountController.show);
router.put('/:id', validateRequest(updateAccountSchema), accountController.update);
router.delete('/:id', accountController.destroy);

module.exports = router;
