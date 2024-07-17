const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { updateUserSchema } = require('../validationSchemas');

const {authenticateJWT} = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/authRole');

//router.get('/create', userController.create);

router.get('/', userController.index);
router.get('/:id', userController.show);
router.put('/:id', validateRequest(updateUserSchema), userController.update);
router.delete('/:id', userController.destroy);
router.post('/received', userController.recived)
router.post('/sent', userController.sent)
router.post('/expenses',isCustomer, userController.expenses)

module.exports = router;
