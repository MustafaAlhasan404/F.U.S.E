const express = require('express');
const router = express.Router();
const encry = require("../middleware/encryptionMiddleware")
const encryM = require('../middleware/mobileEncryptionMiddleware')
const encryR = require('../middleware/regMobileEncryptionMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { keySchema } = require('../validationSchemas');

// dashboard
router.post('/dashboard/generate',validateRequest(keySchema), encry.genKeysDashboard);

// mobile
router.post('/publicKey',validateRequest(keySchema), encryM.genPublicKey);
router.post('/setAESkey',validateRequest(keySchema), encryM.getAESkey);

// mobile register new user
router.post('/reg/publicKey',validateRequest(keySchema), encryR.genPublicKeyForReg);
router.post('/reg/setAESkey',validateRequest(keySchema), encryR.getAESkey);

module.exports = router;
