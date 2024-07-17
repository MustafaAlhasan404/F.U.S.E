const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validationMiddleware');
const {signInSchema,signUpSchema, signUpSchemaEmployee} = require('../validationSchemas');
const {authenticateJWT} = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authRole')
const encry = require('../middleware/encryptionMiddleware')
const encryM = require('../middleware/mobileEncryptionMiddleware')
const encryR = require('../middleware/regMobileEncryptionMiddleware')


router.post('/login', encryM.decryptionMobile, validateRequest(signInSchema), authController.login);
router.post('/register',encryR.decryptionMobile, validateRequest(signUpSchema), authController.register);

router.post('/dashboard/login', encry.decryption, validateRequest(signInSchema), authController.loginDashboard);
router.post('/register/employee', authenticateJWT, isAdmin, encry.decryption, validateRequest(signUpSchemaEmployee), authController.registerEmployee);

router.get('/logout', authController.logout);


module.exports = router;
